#!/usr/bin/env bash

set -euo pipefail

readonly workflow="terraform.yml"
readonly branch="main"
readonly confirmation="destroy salesforce-manager-dev"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$1" >&2
    exit 1
  fi
}

usage() {
  printf 'Usage: %s [--yes]\n' "$0"
}

skip_confirmation=false
case "${1:-}" in
  "")
    ;;
  --yes)
    skip_confirmation=true
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac

if [[ "$#" -gt 1 ]]; then
  usage >&2
  exit 2
fi

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
  printf 'Run this command inside the Git repository.\n' >&2
  exit 1
}

cd "$repo_root"

require_command git
require_command gh

if ! gh auth status >/dev/null 2>&1; then
  printf 'GitHub CLI is not authenticated. Run: gh auth login\n' >&2
  exit 1
fi

repo=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')

for variable in AWS_REGION AWS_ACCOUNT_ID TF_STATE_BUCKET; do
  if ! gh variable get "$variable" --repo "$repo" >/dev/null 2>&1; then
    printf 'Missing GitHub repository variable: %s\n' "$variable" >&2
    exit 1
  fi
done

if ! git remote get-url origin >/dev/null 2>&1; then
  printf 'The repository must have an origin remote.\n' >&2
  exit 1
fi

if ! git ls-remote --exit-code --quiet origin "refs/heads/$branch" >/dev/null; then
  printf 'The remote %s branch does not exist.\n' "$branch" >&2
  exit 1
fi

if [[ "$skip_confirmation" != true ]]; then
  printf 'This will destroy the Terraform-managed dev environment in AWS.\n'
  printf 'The S3 Terraform state bucket and GitHub OIDC resources will remain.\n'
  printf 'Type "%s" to continue: ' "$confirmation"
  read -r typed_confirmation
  if [[ "$typed_confirmation" != "$confirmation" ]]; then
    printf 'Destruction cancelled.\n'
    exit 1
  fi
fi

previous_run_id=$(gh run list \
  --repo "$repo" \
  --workflow "$workflow" \
  --branch "$branch" \
  --event workflow_dispatch \
  --limit 1 \
  --json databaseId \
  --jq '.[0].databaseId // ""')

printf 'Dispatching Terraform destroy for %s/%s...\n' "$repo" "$branch"
gh workflow run "$workflow" \
  --repo "$repo" \
  --ref "$branch" \
  --field action=destroy

run_id=""
for attempt in $(seq 1 30); do
  candidate=$(gh run list \
    --repo "$repo" \
    --workflow "$workflow" \
    --branch "$branch" \
    --event workflow_dispatch \
    --limit 1 \
    --json databaseId \
    --jq '.[0].databaseId // ""')

  if [[ -n "$candidate" && "$candidate" != "$previous_run_id" ]]; then
    run_id=$candidate
    break
  fi

  sleep 2
done

if [[ -z "$run_id" ]]; then
  printf 'Unable to locate the dispatched Terraform run.\n' >&2
  exit 1
fi

run_url="https://github.com/${repo}/actions/runs/${run_id}"
printf 'Watching %s\n' "$run_url"

set +e
gh run watch "$run_id" --repo "$repo" --exit-status
status=$?
set -e

if [[ "$status" -eq 0 ]]; then
  printf 'Terraform destroy completed: %s\n' "$run_url"
else
  printf 'Terraform destroy failed: %s\n' "$run_url" >&2
fi

exit "$status"
