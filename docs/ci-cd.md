# CI/CD Setup

The repository contains four GitHub Actions workflows:

- `.github/workflows/ci.yml` runs backend tests/build/lint, frontend lint/build/E2E tests, and both Docker builds.
- `.github/workflows/deploy.yml` builds immutable commit-SHA images, pushes them to ECR, updates ECS task definitions/services, waits for stability, and runs ALB smoke tests. It is also reusable by the full-stack workflow.
- `.github/workflows/deploy-stack.yml` applies Terraform, reads the current ALB URL, calls the application deployment workflow, and refreshes the non-secret `ALB_URL` repository variable.
- `.github/workflows/terraform.yml` validates and plans Terraform on infrastructure pull requests and provides manually triggered `plan`, `apply`, and `destroy` operations.

## GitHub Configuration

The deployment workflow uses the `salesforce-manager-github-actions` IAM role through GitHub OIDC. It does not require long-lived AWS access keys.

Configure these repository variables:

```text
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=<AWS account ID>
TF_STATE_BUCKET=<Terraform state bucket>
ECR_FRONTEND_REPOSITORY=salesforce-manager-dev-frontend
ECR_BACKEND_REPOSITORY=salesforce-manager-dev-backend
ECS_CLUSTER=salesforce-manager-dev
ECS_FRONTEND_SERVICE=salesforce-manager-dev-frontend
ECS_BACKEND_SERVICE=salesforce-manager-dev-backend
ECS_FRONTEND_TASK_DEFINITION=salesforce-manager-dev-frontend
ECS_BACKEND_TASK_DEFINITION=salesforce-manager-dev-backend
ECS_FRONTEND_CONTAINER=frontend
ECS_BACKEND_CONTAINER=backend
ALB_URL=http://<ALB DNS name>
DEPLOY_ENABLED=false
```

Set `DEPLOY_ENABLED=true` only when automatic deployments from pushes to `main` should be enabled. The explicit `./scripts/deploy.sh` workflow bypasses this gate after Terraform succeeds, so a manual variable toggle is not required for the one-command deployment.

The `dev` GitHub Environment should contain the deployment approval or protection rules if manual approval is desired.

## Frontend API URL

`NEXT_PUBLIC_API_URL` is compiled into the Next.js browser bundle. The deployment workflow passes `ALB_URL` as the frontend Docker build argument:

```text
NEXT_PUBLIC_API_URL=http://<ALB DNS name>
```

The backend CORS configuration must allow the same value. Salesforce credentials are not passed through GitHub Actions; they should be injected into the backend ECS task from AWS Secrets Manager.

## Deployment Commands

After the one-time state bucket, OIDC role, repository variables, and Salesforce Secrets Manager values are configured:

```bash
./scripts/deploy.sh
```

The script requires a clean local `main` branch synchronized with `origin/main`, then dispatches `.github/workflows/deploy-stack.yml`. GitHub Actions applies Terraform, verifies the two Salesforce secret values without printing them, builds and pushes both images, deploys ECS, runs ALB smoke tests, and updates `ALB_URL`.

The explicit teardown command is:

```bash
./scripts/destroy.sh
```

It asks for confirmation, dispatches the Terraform destroy workflow, and preserves the remote state bucket and external GitHub OIDC resources. Use `./scripts/destroy.sh --yes` only for intentional non-interactive teardown.

The application workflow also runs on pushes to `main` and can be started manually with `workflow_dispatch`. Those direct runs still require `DEPLOY_ENABLED=true` and use the latest stored `ALB_URL`.

The workflow tags images with the Git commit SHA and GitHub run ID, making deployments traceable, retry-safe with immutable ECR tags, and rollback-friendly:

```text
<ECR registry>/salesforce-manager-dev-frontend:<commit-sha>-<run-id>
<ECR registry>/salesforce-manager-dev-backend:<commit-sha>-<run-id>
```

## Terraform Workflow

Terraform files are validated and planned on pull requests that change `infra/**`. Manual workflow dispatch supports:

```text
plan
apply
destroy
```

Configure the `dev` GitHub Environment with required reviewers before using `apply` or `destroy`. The workflow references the existing `salesforce-manager-github-actions` role and does not create or modify the GitHub OIDC provider.

Terraform initializes the remote backend with `TF_STATE_BUCKET`, `dev/terraform.tfstate`, and the configured AWS region. It does not copy `backend.tf.example` or require an account-specific backend file in the GitHub runner.

## Current Boundary

Terraform provisions the AWS platform and baseline ECS resources. The application deployment workflow owns image builds and ECS image revisions; the full-stack workflow coordinates both responsibilities without making Terraform own the application image tags.
