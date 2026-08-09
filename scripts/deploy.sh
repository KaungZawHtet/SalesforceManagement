#!/usr/bin/env bash

set -euo pipefail

readonly workflow="deploy-stack.yml"
readonly branch="main"

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

previous_run_id=$(gh run list \
  --repo "$repo" \
  --workflow "$workflow" \
  --branch "$branch" \
  --event workflow_dispatch \
  --limit 1 \
  --json databaseId \
  --jq '.[0].databaseId // ""')

printf 'Dispatching %s for %s...\n' "$workflow" "$repo/$branch"
gh workflow run "$workflow" --repo "$repo" --ref "$branch"

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
  printf 'Unable to locate the dispatched workflow run.\n' >&2
  exit 1
fi

run_url="https://github.com/${repo}/actions/runs/${run_id}"
printf 'Watching %s\n' "$run_url"

set +e
gh run watch "$run_id" --repo "$repo" --exit-status
status=$?
set -e

if [[ "$status" -eq 0 ]]; then
  printf 'Deployment completed: %s\n' "$run_url"
else
  printf 'Deployment failed: %s\n' "$run_url" >&2
fi

exit "$status"
