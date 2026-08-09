#!/usr/bin/env bash

set -euo pipefail

readonly workflow="deploy-stack.yml"
readonly terraform_workflow="terraform.yml"
readonly branch="main"
readonly cluster="salesforce-manager-dev"
readonly alb_name="salesforce-manager-dev-alb"
readonly frontend_repository="salesforce-manager-dev-frontend"
readonly backend_repository="salesforce-manager-dev-backend"
readonly client_id_secret="salesforce-manager-dev/sf-client-id"
readonly client_secret_secret="salesforce-manager-dev/sf-client-secret"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$1" >&2
    exit 1
  fi
}

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
  printf 'Run this command inside the Git repository.\n' >&2
  exit 1
}

cd "$repo_root"

require_command git
require_command gh
require_command aws
require_command python3

if ! gh auth status >/dev/null 2>&1; then
  printf 'GitHub CLI is not authenticated. Run: gh auth login\n' >&2
  exit 1
fi

repo=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
current_branch=$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)

if [[ "$current_branch" != "$branch" ]]; then
  printf 'Deployments must be started from the %s branch; current branch is %s.\n' \
    "$branch" "${current_branch:-detached HEAD}" >&2
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  printf 'The repository must have an origin remote.\n' >&2
  exit 1
fi

git fetch --quiet origin "$branch"

if [[ -n "$(git status --porcelain --untracked-files=all)" ]]; then
  printf 'The worktree must be clean before deploying.\n' >&2
  exit 1
fi

local_sha=$(git rev-parse HEAD)
remote_sha=$(git rev-parse "origin/$branch")
if [[ "$local_sha" != "$remote_sha" ]]; then
  printf 'Local %s is not synchronized with origin/%s. Push the intended commit first.\n' \
    "$branch" "$branch" >&2
  exit 1
fi

for variable in AWS_REGION AWS_ACCOUNT_ID TF_STATE_BUCKET; do
  if ! gh variable get "$variable" --repo "$repo" >/dev/null 2>&1; then
    printf 'Missing GitHub repository variable: %s\n' "$variable" >&2
    exit 1
  fi
done

aws_region=$(gh variable get AWS_REGION --repo "$repo")
aws_profile=${AWS_PROFILE:-salesforce-manager}

if ! aws sts get-caller-identity --profile "$aws_profile" >/dev/null 2>&1; then
  printf 'AWS profile is not available: %s\n' "$aws_profile" >&2
  exit 1
fi

if [[ ! -f "$repo_root/backend/.env" ]]; then
  printf 'Missing Salesforce environment file: %s\n' "$repo_root/backend/.env" >&2
  exit 1
fi

latest_run_id() {
  gh run list \
    --repo "$repo" \
    --workflow "$1" \
    --branch "$branch" \
    --event workflow_dispatch \
    --limit 1 \
    --json databaseId \
    --jq '.[0].databaseId // ""'
}

dispatch_and_watch() {
  local workflow_file="$1"
  shift
  local previous_run_id
  local candidate
  local run_id=""
  local status

  previous_run_id=$(latest_run_id "$workflow_file")
  printf 'Dispatching %s for %s...\n' "$workflow_file" "$repo/$branch"
  gh workflow run "$workflow_file" --repo "$repo" --ref "$branch" "$@"

  for attempt in $(seq 1 30); do
    candidate=$(latest_run_id "$workflow_file")

    if [[ -n "$candidate" && "$candidate" != "$previous_run_id" ]]; then
      run_id=$candidate
      break
    fi

    sleep 2
  done

  if [[ -z "$run_id" ]]; then
    printf 'Unable to locate the dispatched workflow run: %s\n' "$workflow_file" >&2
    return 1
  fi

  local run_url="https://github.com/${repo}/actions/runs/${run_id}"
  printf 'Watching %s\n' "$run_url"

  set +e
  gh run watch "$run_id" --repo "$repo" --exit-status
  status=$?
  set -e

  if [[ "$status" -ne 0 ]]; then
    printf 'Workflow failed: %s\n' "$run_url" >&2
    return "$status"
  fi

  LAST_RUN_URL="$run_url"
}

infrastructure_ready() {
  local cluster_status
  cluster_status=$(aws ecs describe-clusters \
    --profile "$aws_profile" \
    --region "$aws_region" \
    --clusters "$cluster" \
    --query 'clusters[0].status' \
    --output text 2>/dev/null || true)

  [[ "$cluster_status" == "ACTIVE" ]] || return 1

  aws elbv2 describe-load-balancers \
    --profile "$aws_profile" \
    --region "$aws_region" \
    --names "$alb_name" \
    >/dev/null 2>&1 || return 1

  aws ecr describe-repositories \
    --profile "$aws_profile" \
    --region "$aws_region" \
    --repository-names "$frontend_repository" "$backend_repository" \
    >/dev/null 2>&1 || return 1

  for secret_id in "$client_id_secret" "$client_secret_secret"; do
    aws secretsmanager describe-secret \
      --profile "$aws_profile" \
      --region "$aws_region" \
      --secret-id "$secret_id" \
      >/dev/null 2>&1 || return 1
  done
}

sync_salesforce_secrets() {
  local env_file="$repo_root/backend/.env"

  if [[ ! -f "$env_file" ]]; then
    printf 'Missing Salesforce environment file: %s\n' "$env_file" >&2
    return 1
  fi

  python3 - "$env_file" "$aws_profile" "$aws_region" "$client_id_secret" "$client_secret_secret" <<'PY'
from pathlib import Path
import subprocess
import sys

env_file, aws_profile, aws_region, client_id_secret_name, client_secret_name = sys.argv[1:]
values = {}

for raw_line in Path(env_file).read_text().splitlines():
    line = raw_line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue

    key, value = line.split("=", 1)
    key = key.strip()
    if key.startswith("export "):
        key = key[7:].strip()
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
        value = value[1:-1]
    values[key] = value

secrets = {
    client_id_secret_name: values.get("SF_CLIENT_ID", ""),
    client_secret_name: values.get("SF_CLIENT_SECRET", ""),
}

for secret_name, value in secrets.items():
    if not value:
        raise SystemExit(f"Missing or empty Salesforce value for {secret_name} in {env_file}")

    base = [
        "aws", "secretsmanager", "--profile", aws_profile,
        "--region", aws_region,
    ]
    exists = subprocess.run(
        base + ["describe-secret", "--secret-id", secret_name],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    ).returncode == 0
    operation = "put-secret-value" if exists else "create-secret"
    identifier_flag = "--secret-id" if exists else "--name"
    subprocess.run(
        base + [operation, identifier_flag, secret_name, "--secret-string", value],
        check=True,
        stdout=subprocess.DEVNULL,
    )

print("Salesforce secrets synchronized to AWS Secrets Manager")
PY
}

update_alb_variable() {
  local alb_dns_name

  alb_dns_name=$(aws elbv2 describe-load-balancers \
    --profile "$aws_profile" \
    --region "$aws_region" \
    --names "$alb_name" \
    --query 'LoadBalancers[0].DNSName' \
    --output text 2>/dev/null || true)

  if [[ -z "$alb_dns_name" || "$alb_dns_name" == "None" ]]; then
    printf 'Warning: unable to read the ALB URL for ALB_URL update.\n' >&2
    return 0
  fi

  if ! gh variable set ALB_URL \
    --repo "$repo" \
    --body "http://${alb_dns_name}"; then
    printf 'Warning: deployment succeeded, but ALB_URL could not be updated.\n' >&2
  fi
}

if ! infrastructure_ready; then
  printf 'Infrastructure is not ready. Running Terraform apply first...\n'
  dispatch_and_watch "$terraform_workflow" --field action=apply
fi

sync_salesforce_secrets
dispatch_and_watch "$workflow"
update_alb_variable

printf 'Deployment completed successfully: %s\n' "$LAST_RUN_URL"
