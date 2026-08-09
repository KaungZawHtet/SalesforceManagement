# One-Command AWS Deployment Plan

## Goal

Provide two local commands that orchestrate all AWS operations through GitHub Actions:

```bash
./scripts/deploy.sh
./scripts/destroy.sh
```

`deploy.sh` must deploy the pushed `main` branch by running Terraform first, then building and deploying the frontend/backend images from GitHub Actions. `destroy.sh` must run Terraform destroy through GitHub OIDC and preserve the remote Terraform state bucket.

## Decisions

- The scripts are local wrappers around `gh workflow run`; Terraform and AWS operations run on GitHub-hosted runners.
- No local AWS credentials are required for deploy or destroy. GitHub Actions assumes `salesforce-manager-github-actions` through OIDC.
- Deploy uses remote `main` only. The wrapper requires the local branch to be `main`, a clean worktree, and local `HEAD` to match `origin/main`, preventing deployment of unpushed code.
- Salesforce secret values are provisioned once in AWS Secrets Manager and are not read from `.env`, GitHub variables, or GitHub logs. The deployment workflow validates that both secret values are available and fails with an actionable message if they are not.
- The explicit deploy command bypasses the existing `DEPLOY_ENABLED` gate. The gate remains in effect for automatic push-to-`main` deployments through `deploy.yml`.
- Destroy requires an explicit confirmation in the script and supports an optional `--yes` flag. It destroys only the Terraform-managed dev environment; the bootstrap state bucket, GitHub OIDC provider, and external GitHub role remain.
- The state bucket bootstrap remains a one-time prerequisite because Terraform needs the bucket before it can initialize the remote backend.

## Current Gaps

- `terraform.yml` and `deploy.yml` are separate manual workflows, so there is no single workflow that applies infrastructure and then deploys application images.
- `terraform.yml` copies `backend.tf.example`, which contains `REPLACE-ME`; GitHub runners therefore cannot reliably initialize the real remote backend.
- The current Terraform workflow copies example variables without a controlled secret-readiness strategy.
- The application workflow requires a manually maintained `ALB_URL`, even though Terraform is the source of truth and an ALB can receive a new DNS name after recreation.
- `scripts/` is empty, so there are no local orchestration or teardown commands.
- The existing deploy workflow owns the ECS image deployment logic and should be made reusable instead of duplicating that logic in a second workflow.

## Implementation

### 1. Add the local deploy wrapper

Create executable `scripts/deploy.sh` with strict shell options and repository-root discovery. It should:

1. Require `git` and `gh`.
2. Confirm `gh auth status` succeeds and identify the current GitHub repository with `gh repo view --json nameWithOwner`.
3. Confirm the current branch is `main`.
4. Fetch `origin/main`, require a clean working tree, and require `HEAD == origin/main`.
5. Confirm the required one-time GitHub configuration exists, especially `AWS_REGION`, `AWS_ACCOUNT_ID`, and `TF_STATE_BUCKET`.
6. Dispatch `.github/workflows/deploy-stack.yml` on `main`.
7. Locate the newly created workflow run, watch it with `gh run watch --exit-status`, and return the workflow exit status.
8. Print the workflow URL on success or failure.

The run lookup must avoid accidentally watching an older run. Record the dispatch time, poll `gh run list` until a `workflow_dispatch` run created after that time appears, then watch that run.

### 2. Add the local destroy wrapper

Create executable `scripts/destroy.sh` with the same repository and GitHub authentication checks. It should:

1. Confirm the repository and `main` branch are available remotely.
2. Print the exact destruction scope and the resources intentionally preserved.
3. Require the user to type `destroy salesforce-manager-dev`, unless `--yes` is supplied.
4. Dispatch `.github/workflows/terraform.yml` with `action=destroy` on `main`.
5. Watch the new run and return its exit status.

Do not run local `terraform destroy`, `aws`, `git reset`, or other destructive commands from the wrapper. All destruction must use the remote state and the GitHub OIDC role.

### 3. Make the Terraform workflow backend-safe

Update `.github/workflows/terraform.yml` so every Terraform job:

- Requires the repository variable `TF_STATE_BUCKET`.
- Generates or initializes the backend using the configured bucket, region, and `dev/terraform.tfstate` key instead of copying an unusable `REPLACE-ME` backend file.
- Uses the same Terraform version and working directory for validate, plan, apply, and destroy.
- Applies/destroys only from the protected `main` workflow dispatch path.
- Keeps the existing concurrency group so apply and destroy cannot run concurrently.

Use a GitHub variable for the state bucket name rather than committing an account-specific bucket name into workflow-generated files. Keep the bootstrap state bucket outside the dev environment destroy path.

### 4. Normalize Terraform example variables

Update `infra/environments/dev/terraform.tfvars.example` and related documentation so example secret ARN values are empty by default and Terraform uses the module-created secret container ARNs unless an external ARN is intentionally supplied. Do not place Salesforce values in the example file.

The unified deploy workflow should:

- Create a temporary `terraform.tfvars` from the safe example.
- Apply with `salesforce_secrets_ready=true` only after the workflow verifies both expected Secrets Manager values exist.
- Keep secret contents out of command output and artifacts.

The first-ever environment still has a one-time setup sequence: apply the platform with secret injection disabled, populate both secret containers, then run `./scripts/deploy.sh`. This is required because the chosen design deliberately does not accept local secret values or place them in GitHub.

### 5. Add the unified GitHub deployment workflow

Create `.github/workflows/deploy-stack.yml` with `workflow_dispatch` only. It should use:

- `contents: read`, `id-token: write`, and the minimum additional permission required to refresh the non-secret `ALB_URL` repository variable.
- The `dev` GitHub Environment and the existing `deploy-dev` concurrency boundary.
- A Terraform apply job that checks out `main`, configures AWS OIDC, initializes the remote backend, verifies both Secrets Manager values without printing them, applies the dev environment, and exposes `alb_url` as a job output.
- A dependent application deployment job that receives `alb_url` from Terraform and invokes the reusable ECS deployment workflow.

The Terraform job must not apply arbitrary local changes because the wrapper only dispatches after confirming the pushed `main` commit. It should run with `-input=false` and `-auto-approve` after GitHub Environment protection has been evaluated.

### 6. Reuse the existing ECS deployment workflow

Extend `.github/workflows/deploy.yml` with `workflow_call` inputs:

- `alb_url`, defaulting to the existing repository variable for direct push/manual deployments.
- An explicit flag that permits the unified stack workflow to bypass `DEPLOY_ENABLED`.

Preserve the current push-to-`main` behavior and safety gate. When called by `deploy-stack.yml`, use Terraform's current `alb_url` output for the frontend build argument and smoke tests, so a recreated ALB never uses a stale URL.

Keep the existing deployment behavior unchanged otherwise:

- Build immutable backend/frontend images using commit SHA and run ID.
- Push to the Terraform-created ECR repositories.
- Render task definitions and remove placeholder BusyBox commands/health checks.
- Deploy frontend and backend services with ECS stability waits.
- Run frontend and `/api/health` smoke tests.

After a successful unified deployment, update the non-secret `ALB_URL` repository variable so future direct `deploy.yml` runs remain usable. Handle both an existing variable update and first-time variable creation. Do not write any Salesforce secret or token to GitHub variables.

### 7. Document the command contract

Update `README.md`, `infra/README.md`, `docs/ci-cd.md`, and `docs/aws-terraform-deployment-guide.md` with:

- One-time prerequisites: AWS bootstrap state bucket, GitHub OIDC role, repository variables including `TF_STATE_BUCKET`, GitHub authentication, and populated Salesforce Secrets Manager values.
- The primary deploy command: `./scripts/deploy.sh`.
- The primary destroy command: `./scripts/destroy.sh` and optional `./scripts/destroy.sh --yes`.
- Clear ownership: Terraform creates the platform; GitHub Actions builds/pushes images and updates ECS task definitions; the state bucket is preserved.
- The fact that a destroy followed by a future deploy requires repopulating the Salesforce secret containers because they are part of the dev environment.
- The expected workflow stages and how to inspect the linked GitHub Actions run.
- Failure recovery for a timed-out Terraform run: wait for ECS draining, then rerun the wrapper rather than applying a stale saved plan.

Do not document the command as fully zero-setup. The state bucket, OIDC role, and Salesforce secret values are intentional one-time prerequisites.

## Validation

Run local static checks:

```bash
bash -n scripts/deploy.sh scripts/destroy.sh
terraform fmt -check -recursive infra
```

Validate workflow and Terraform configuration in CI or with available local tools:

- Parse all GitHub Actions YAML files with a YAML parser or `actionlint` when available.
- Run bootstrap `terraform init -backend=false` and `terraform validate`.
- Run dev `terraform init -backend=false` and `terraform validate` using generated temporary backend/variable files.
- Confirm no Salesforce client secret, access token, `.env` content, or real secret value appears in the diff.
- Mock `gh` in shell tests or exercise the wrapper against a harmless test workflow to verify run discovery and failure propagation.

After implementation, perform one real `./scripts/deploy.sh` run and verify the GitHub run shows Terraform apply followed by image push, ECS service stability, ALB smoke tests, and the refreshed `ALB_URL`. Perform `./scripts/destroy.sh` only when the demo environment is intentionally being removed, then verify the dev resources are gone and the state bucket/object remain.

## Risks And Controls

- **Unpushed code deployment:** prevented by requiring `main`, a clean tree, and `HEAD == origin/main`.
- **Stale ALB URL:** prevented by passing the Terraform output directly to the application deployment and updating the repository variable afterward.
- **Secret startup failure:** prevented by checking both secret values before enabling ECS secret injection.
- **Concurrent apply/destroy:** prevented by a shared GitHub Actions concurrency group and the destroy confirmation.
- **Accidental state deletion:** prevented by keeping the bootstrap state bucket outside the dev state and preserving its `prevent_destroy` lifecycle guard.
- **Workflow permission expansion:** limit the additional GitHub permission to updating the non-secret repository variable; never grant or use long-lived AWS keys.
