# AWS Terraform Deployment Plan

## Goal

Deploy the existing Salesforce Account Manager as a low-cost, interview-ready AWS demo that visibly demonstrates Terraform, containerization, networking, IAM, secrets management, observability, and CI/CD without introducing Kubernetes or a database that the application does not need.

Store committed, user-facing architecture diagrams under `docs/architecture/`. Use a single `docs/architecture/aws-deployment.md` document for Mermaid source diagrams, and optionally add exported SVG/PNG versions later for interview presentations. Link the document from the root `README.md` when the implementation phase adds the documentation.

## Current State And Constraints

- The repository contains a Next.js frontend and NestJS backend, each containerized with Docker.
- The backend is the only Salesforce integration boundary and currently owns the Salesforce OAuth client credentials and in-memory token cache.
- The backend exposes `GET /api/health`, `GET /api/accounts`, and `POST /api/accounts`.
- The application is stateless and has no database, Redis, or user authentication requirement.
- The frontend image uses Next.js standalone output and compiles `NEXT_PUBLIC_API_URL` at image build time. Setting it only as an ECS runtime variable will not change the built client bundle.
- The deployment target is ECS Fargate.
- The demo uses the ALB DNS name rather than a custom domain or ACM certificate.
- GitHub Actions is the CI/CD platform.
- Terraform state is stored remotely in S3 with native state locking; only a low-cost `dev/demo` environment is deployed initially.
- Salesforce credentials are stored in AWS Secrets Manager and injected only into the backend task.
- Terraform creates Secrets Manager secret containers, but secret values are populated separately through the AWS Console or CLI and never enter Terraform state.
- Terraform references the already-created `salesforce-manager-github-actions` role/OIDC setup by ARN; it does not manage or replace that trust relationship.
- Terraform owns AWS infrastructure, ECR repositories, ECS services, and baseline task definitions. GitHub Actions owns image tags and application deployment revisions.
- Initial ECS bootstrap is two-phase: Terraform creates services with a temporary public placeholder image, then GitHub Actions pushes the real commit-tagged images and updates ECS.

## Target Architecture

```text
Browser
  |
  v
Public Application Load Balancer
  |-- default route: frontend target group -> private frontend ECS service
  |-- /api/* route: backend target group -> private backend ECS service
  |
  +-- CloudWatch access logs (optional but preferred)

Private ECS/Fargate tasks in private subnets
  |-- Next.js frontend container
  |-- NestJS backend container
          |-- Secrets Manager: Salesforce client ID and secret
          |-- Salesforce REST API over HTTPS

ECR repositories: frontend and backend images
Terraform S3 backend: remote state and locking
CloudWatch Logs: separate log groups for frontend and backend
GitHub Actions: test -> build -> scan -> push -> deploy -> smoke test
```

Use one public ALB and two target groups. Route `/api/*` to the backend, preserving the existing backend route prefix. The frontend should be built with `NEXT_PUBLIC_API_URL` set to the public ALB base URL or an empty same-origin value, depending on the existing API client implementation. Prefer same-origin `/api` calls to eliminate CORS complexity; if the current client requires an absolute URL, pass the ALB URL as a build argument and set backend `CORS_ORIGIN` to the same ALB URL.

Keep ECS tasks in private subnets. The ALB is internet-facing in public subnets. Private task subnets need outbound access to ECR, CloudWatch Logs, Secrets Manager, and Salesforce. Use one NAT gateway in a single availability zone for this short-lived demo to limit recurring cost; document one NAT gateway per AZ as the production availability option and VPC endpoints as a future cost optimization.

## Terraform Layout

Create an infrastructure boundary such as:

```text
infra/
  bootstrap/
    main.tf
    variables.tf
    outputs.tf
  environments/
    dev/
      backend.tf
      providers.tf
      main.tf
      variables.tf
      terraform.tfvars.example
      outputs.tf
  modules/
    network/
    ecr/
    secrets/
    ecs/
    alb/
    observability/
```

Keep the first implementation modular but small. Avoid a generic multi-cloud abstraction. Pin Terraform and AWS provider versions, configure default tags, and validate variables such as AWS region, project name, environment, container ports, image tags, and secret ARNs.

### Bootstrap State

- Add a one-time bootstrap configuration for an S3 bucket dedicated to Terraform state.
- Enable bucket versioning, server-side encryption, public access blocking, and lifecycle protection against accidental deletion.
- Configure native S3 state locking supported by the selected Terraform version/provider workflow.
- Document that bootstrap is run once with local state and that the resulting bucket name is then referenced by `environments/dev/backend.tf`.
- Do not put Salesforce secret values in Terraform variables, `tfvars`, GitHub variables, or state.

### Network Module

- Create a VPC with DNS support enabled.
- Create two public subnets and two private subnets across two availability zones.
- Create an internet gateway for public subnets.
- Create one NAT gateway for private subnet egress, with an explicit variable to disable it only if an alternative egress design is supplied.
- Create public and private route tables and associations.
- Create security groups with least-privilege rules:
  - ALB: inbound TCP 80 from the internet; outbound to task security groups.
  - Frontend tasks: inbound only from the ALB security group on port 3001; outbound HTTPS and required egress.
  - Backend tasks: inbound only from the ALB security group on port 3000; outbound HTTPS for Salesforce and AWS services.
- Do not expose ECS task public IPs.

### ECR Module

- Create separate private ECR repositories for `frontend` and `backend`.
- Enable image scanning on push, encryption, lifecycle cleanup of old untagged/old images, and immutable tags if the CI strategy supports unique SHA tags.
- Output repository URLs for GitHub Actions and ECS task definitions.

### Secrets Module

- Create two Secrets Manager secret containers without values: `salesforce-manager/dev/sf-client-id` and `salesforce-manager/dev/sf-client-secret`.
- Populate secret values outside Terraform using the AWS Console or CLI. Do not use `aws_secretsmanager_secret_version` with plaintext Terraform variables.
- Store Salesforce client ID and client secret as separate secrets and inject their ARNs into the backend task definition.
- Inject only `SF_CLIENT_ID` and `SF_CLIENT_SECRET` into the backend task definition using ECS `secrets` entries.
- Keep non-sensitive configuration in task definition environment variables: `PORT`, `SF_LOGIN_URL`, `SF_API_VERSION`, and `CORS_ORIGIN`.
- Grant the ECS task execution role permission to retrieve only the referenced secret ARNs. Do not grant broad Secrets Manager access.
- Grant the task execution role ECR pull and CloudWatch Logs permissions only.

### ECS Module

- Create an ECS cluster with Container Insights enabled if the cost impact is acceptable for the demo; otherwise document it as an optional toggle.
- Create separate task definitions and services for frontend and backend using Fargate.
- Use a small demo size, such as `0.25 vCPU` and `0.5 GB` per task, with desired count `1` initially.
- Create baseline task definitions and services with a temporary public placeholder image that is available before the first apply; keep the image tag configurable and ensure the first GitHub deployment replaces it.
- Set deployment circuit breakers with rollback enabled.
- Configure `awslogs` logging to separate CloudWatch log groups with retention suitable for a demo.
- Configure health checks:
  - Backend container and target group: `GET /api/health` on port 3000.
  - Frontend target group: `/` on port 3001, or a dedicated lightweight route if the current Next.js behavior makes `/` unsuitable.
- Add container start/stop timeouts and a reasonable deregistration delay.
- Set `enable_execute_command` only if explicitly needed for an interview walkthrough; if enabled, document the IAM and audit implications.
- Make image tags variables so CI can deploy immutable commit SHA tags.

### ALB Module

- Create an internet-facing ALB in public subnets.
- Create frontend and backend target groups with IP target type.
- Create an HTTP listener on port 80.
- Forward `/api/*` to the backend target group and use the frontend target group as the default action.
- Add a higher-priority health route if needed only after verifying ALB rule behavior; do not create unnecessary listener rules.
- Output the ALB DNS name and URLs for smoke tests.
- Keep HTTPS/custom domain explicitly out of the initial scope; document ACM/Route 53 as a production hardening follow-up.

### IAM And Observability

- Separate ECS task execution and task roles.
- Task execution role: ECR pull, CloudWatch Logs write, and secret retrieval required by ECS secret injection.
- Application task role: no permissions unless the application later calls AWS APIs directly.
- Add CloudWatch log groups, retention, and optional ALB access logging to an S3 bucket with lifecycle controls.
- Add basic CloudWatch alarms for ALB 5xx responses, unhealthy targets, and ECS service task count below desired count. Keep alarms actionable and avoid noisy metrics.

## Application And Container Adjustments

Review and implement only the deployment changes needed to support the AWS topology:

1. Confirm the frontend API client can call same-origin `/api` paths. If it currently requires `NEXT_PUBLIC_API_URL`, support a build argument in CI that points to the ALB URL and ensure the backend CORS origin matches it.
2. Ensure the frontend Docker build receives the production API URL at build time, not merely as an ECS runtime variable.
3. Verify both Dockerfiles run as non-root where practical, use deterministic dependency installation, and exclude local `.env` files and build artifacts through `.dockerignore`.
4. Ensure health endpoints work correctly behind the ALB and that the backend binds to `0.0.0.0` through the container configuration.
5. Add or update deployment documentation without exposing real Salesforce credentials.
6. Keep Salesforce credentials server-side and preserve the existing backend-only Salesforce integration.


Add workflows with separate pull request validation, Terraform plan/apply, and application deployment responsibilities.

### Pull Request Workflow

- Install frontend and backend dependencies using lockfiles.
- Run backend unit tests, build, and lint/type validation.
- Run frontend lint/build and Playwright tests with the required test setup.
- Build both Docker images to catch Dockerfile and standalone-output regressions.
- Run a container vulnerability scan, such as Trivy, and fail or report according to the chosen severity threshold.
- Run `terraform fmt -check`, `terraform validate`, and `terraform plan` against the demo environment using the existing GitHub OIDC role and remote state.

### Main Deployment Workflow

- Use GitHub OIDC to assume a narrowly scoped AWS deployment role; do not store long-lived AWS access keys.
- Authenticate to ECR.
- Build frontend and backend images with commit SHA tags.
- Supply the public API base URL as the frontend build argument, or use same-origin `/api` behavior.
- Push images to the corresponding ECR repositories.
- Render/update ECS task definitions with the immutable image tags.
- Deploy/update both ECS services and wait for service stability.
- Run smoke tests against the ALB:
  - `GET /api/health` returns `200` and the expected JSON.
  - Frontend root returns `200`.
  - Account read endpoint reaches the backend and returns a controlled Salesforce error if test credentials are unavailable, rather than an ALB/ECS failure.
- Use GitHub environment protection for deployment approval if the repository supports it.
- Store only non-secret deployment values in GitHub variables. Keep Salesforce values in Secrets Manager.

### Terraform CI/CD Boundary

- Add `.github/workflows/terraform.yml` with pull-request formatting/validation/plan and a manually approved `workflow_dispatch` apply/destroy path.
- Run `terraform plan` on pull requests and publish the plan artifact/output.
- Apply only from the protected main branch.
- Use the existing `salesforce-manager-github-actions` OIDC role by ARN; do not recreate or manage its provider/trust policy in Terraform.
- Never run `terraform apply` automatically on arbitrary pull requests.
- Keep Terraform responsible for infrastructure and baseline task definitions; do not put changing application image tags in Terraform after bootstrap.


1. Audit and, if necessary, correct `.gitignore`/`.dockerignore` coverage for `.env`, `dist`, `.next`, and Terraform state files.
2. Verify local Docker Compose and existing unit/E2E tests before infrastructure changes.
3. Add Terraform bootstrap and create the encrypted, versioned S3 state bucket.
4. Add the dev environment configuration and network, ECR, IAM, Secrets Manager containers, ECS, ALB, and CloudWatch resources.
5. Populate the two Secrets Manager values outside Terraform and confirm their ARNs are referenced by the backend task definition.
6. Apply Terraform with placeholder ECS images and verify network, target groups, service health, and ALB routing.
7. Adjust the existing deployment workflow to consume stable Terraform-created ECS names/outputs, then build and push initial commit-SHA images through GitHub Actions.
8. Verify frontend loading, backend health, Salesforce access, and smoke tests through the ALB.
9. Add Terraform plan/apply/destroy workflow controls and operational documentation: prerequisites, bootstrap, secret creation, GitHub configuration, deploy, rollback, and destroy commands.
   - Include `docs/architecture/aws-deployment.md` with the request-flow, AWS infrastructure, and CI/CD diagrams.
9. Demonstrate rollback by redeploying a previous immutable image tag and verifying ECS deployment circuit-breaker behavior.
10. Destroy the demo environment after the interview when not needed, preserving the state bucket only if it is intended for future use.


- `terraform fmt -check` passes for all Terraform files.
- `terraform init`, `terraform validate`, and `terraform plan` complete without plaintext secret values.
- Terraform does not manage the existing GitHub OIDC provider or `salesforce-manager-github-actions` role.
- Terraform creates ECS services with the placeholder image, and the first application deployment replaces it with a commit-SHA image.
- Terraform plan shows no public IP assignment to ECS tasks.
- ALB listener forwards default traffic to frontend and `/api/*` traffic to backend.
- Backend target health succeeds on `/api/health`.
- Frontend target health succeeds on port 3001.
- ECS services reach desired count and remain stable after deployment.
- Backend logs contain startup and sanitized Salesforce errors but no tokens or client secrets.
- ECR rejects or scans vulnerable images according to the documented policy.
- GitHub Actions uses OIDC and does not contain long-lived AWS credentials.
- Frontend account listing and account creation flow work through the ALB route.
- Invalid requests produce the existing safe validation error shape.
- Salesforce authentication failure, upstream failure, and network failure remain mapped to safe application-level responses.
- `terraform destroy` removes demo compute/network resources and does not unexpectedly delete protected state or externally managed secrets.


- Why ECS Fargate instead of EKS: the workload is two stateless containers, so Fargate demonstrates cloud-native deployment without paying the Kubernetes complexity tax.
- Why one ALB: one public origin simplifies the browser contract and keeps `/api` routing behind the same edge boundary.
- Why private tasks: only the ALB is internet-facing; task security groups permit traffic from the ALB, not arbitrary clients.
- Why Secrets Manager: Salesforce credentials are not baked into images, Terraform variables, GitHub logs, or frontend bundles.
- Why immutable image tags: deployments are traceable to a commit and rollback is deterministic.
- Why remote Terraform state and OIDC: collaboration and CI/CD avoid local state drift and long-lived cloud credentials.
- Why no database: Salesforce is the system of record and the current application does not require persistence beyond Salesforce.
- Cost controls: one task per service, small Fargate sizes, short log retention, lifecycle cleanup, one NAT gateway, and explicit teardown; NAT gateway cost should be called out as the main demo infrastructure trade-off.


- EKS/Kubernetes.
- RDS, DynamoDB, Redis, or application-side persistence.
- User authentication and authorization for the web application.
- Custom domain, Route 53, ACM, HTTPS redirect, and WAF in the first demo iteration.
- Multi-region deployment and active-active failover.
- Autoscaling beyond documenting a production follow-up; the demo begins with one task per service.
- Salesforce OAuth changes or frontend-to-Salesforce communication.
