# CI/CD Setup

The repository contains two GitHub Actions workflows:

- `.github/workflows/ci.yml` runs backend tests/build/lint, frontend lint/build/E2E tests, and both Docker builds.
- `.github/workflows/deploy.yml` builds immutable commit-SHA images, pushes them to ECR, updates ECS task definitions/services, waits for stability, and runs ALB smoke tests.

## GitHub Configuration

The deployment workflow uses the `salesforce-manager-github-actions` IAM role through GitHub OIDC. It does not require long-lived AWS access keys.

Configure these repository variables:

```text
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=<AWS account ID>
ECR_FRONTEND_REPOSITORY=salesforce-manager-frontend
ECR_BACKEND_REPOSITORY=salesforce-manager-backend
ECS_CLUSTER=salesforce-manager-dev
ECS_FRONTEND_SERVICE=salesforce-manager-frontend
ECS_BACKEND_SERVICE=salesforce-manager-backend
ECS_FRONTEND_CONTAINER=frontend
ECS_BACKEND_CONTAINER=backend
ALB_URL=http://<ALB DNS name>
DEPLOY_ENABLED=false
```

Set `DEPLOY_ENABLED=true` only after the ECR repositories, ECS cluster, task definitions, services, and ALB are provisioned. Until then, the deployment workflow exits safely without assuming the AWS role or pushing images.

The `dev` GitHub Environment should contain the deployment approval or protection rules if manual approval is desired.

## Frontend API URL

`NEXT_PUBLIC_API_URL` is compiled into the Next.js browser bundle. The deployment workflow passes `ALB_URL` as the frontend Docker build argument:

```text
NEXT_PUBLIC_API_URL=http://<ALB DNS name>
```

The backend CORS configuration must allow the same value. Salesforce credentials are not passed through GitHub Actions; they should be injected into the backend ECS task from AWS Secrets Manager.

## Deployment Trigger

Deployments run on pushes to `main` and can also be started manually with `workflow_dispatch`.

The workflow tags images with the Git commit SHA, making deployments traceable and rollback-friendly:

```text
<ECR registry>/salesforce-manager-frontend:<commit-sha>
<ECR registry>/salesforce-manager-backend:<commit-sha>
```

## Current Boundary

The workflow assumes that Terraform or a one-time bootstrap has already created the ECR repositories and ECS resources. Terraform workflows are intentionally not added yet. The current change establishes application CI and the container deployment workflow without provisioning AWS infrastructure.
