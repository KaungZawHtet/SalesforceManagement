# Terraform Infrastructure

This directory provisions the temporary AWS demo environment with Terraform.

## Ownership

- Terraform owns the VPC, subnets, NAT gateway, security groups, ECR repositories, ECS cluster/services, ALB, CloudWatch logs, ECS roles, and Secrets Manager secret containers.
- The existing `salesforce-manager-github-actions` OIDC role is created outside Terraform and is referenced by the deployment workflow. Terraform does not manage its trust policy.
- Secret values are populated outside Terraform. They are never stored in Terraform state or GitHub variables.
- Terraform creates baseline ECS task definitions with the placeholder BusyBox image. GitHub Actions replaces the image with the immutable commit SHA image during application deployment.

## One-Time Bootstrap

The bootstrap configuration creates the encrypted, versioned Terraform state bucket. Run it with local state:

```bash
cd infra/bootstrap
cp terraform.tfvars.example terraform.tfvars
# Edit state_bucket_name to a globally unique bucket name.
terraform init
terraform fmt -check
terraform validate
terraform apply
```

Copy the output bucket name into `infra/environments/dev/backend.tf.example`, save the result as `backend.tf`, then initialize the dev environment:

```bash
cd ../environments/dev
cp backend.tf.example backend.tf
terraform init
```

The state bucket has `prevent_destroy = true`. Destroying the demo environment does not delete the state bucket.

## Salesforce Secrets

Terraform creates empty containers named:

```text
salesforce-manager-dev/sf-client-id
salesforce-manager-dev/sf-client-secret
```

Populate them outside Terraform:

```bash
aws secretsmanager put-secret-value \
  --secret-id salesforce-manager-dev/sf-client-id \
  --secret-string '<Salesforce client ID>'

aws secretsmanager put-secret-value \
  --secret-id salesforce-manager-dev/sf-client-secret \
  --secret-string '<Salesforce client secret>'
```

Use `--secret-string` only in a secure local shell. Never place these commands with real values in Git or CI logs.

After the values exist, set this in `terraform.tfvars`:

```hcl
salesforce_secrets_ready = true
```

The first infrastructure apply can use `salesforce_secrets_ready = false` to create the platform without injecting empty secret values. Apply again with `true` after populating the secrets.

Use the Salesforce org's My Domain for `salesforce_login_url` rather than the generic `https://login.salesforce.com` when the connected app is configured for that domain. For this demo, the value is recorded in `terraform.tfvars.example` as:

```hcl
salesforce_login_url = "https://orgfarm-d483781df2-dev-ed.develop.my.salesforce.com"
```

The placeholder ECS containers run BusyBox HTTP servers only so that the initial ALB and ECS health checks can become healthy. The first GitHub Actions deployment replaces them with the real Next.js and NestJS images.

## GitHub Role Permissions

The existing `salesforce-manager-github-actions` role must be able to run the Terraform workflow. Its permissions policy should include the project infrastructure actions described in the IAM setup, plus `iam:PassRole` limited to these ECS roles:

```text
arn:aws:iam::<ACCOUNT_ID>:role/salesforce-manager-dev-ecs-execution
arn:aws:iam::<ACCOUNT_ID>:role/salesforce-manager-dev-ecs-task
```

The `iam:PassRole` statement should include this condition:

```json
{
  "StringEquals": {
    "iam:PassedToService": "ecs-tasks.amazonaws.com"
  }
}
```

## Dev Environment

```bash
cd infra/environments/dev
cp terraform.tfvars.example terraform.tfvars
# Replace ACCOUNT_ID and secret ARN placeholders.
terraform fmt -recursive
terraform validate
terraform plan
terraform apply
```

The main outputs are:

```text
alb_url
alb_dns_name
frontend_ecr_repository_url
backend_ecr_repository_url
ecs_cluster_name
frontend_service_name
backend_service_name
```

## Deployment Order

1. Apply the bootstrap state bucket.
2. Populate `backend.tf` and initialize the dev environment.
3. Apply the dev environment with the placeholder images.
4. Populate Salesforce secrets and apply again with `salesforce_secrets_ready = true`.
5. Set the GitHub repository variables from Terraform outputs.
6. Set `DEPLOY_ENABLED=true`.
7. Push to `main` or manually run the deployment workflow.

## Cleanup

Destroy only the demo environment when the session ends:

```bash
cd infra/environments/dev
terraform destroy
```

The state bucket remains available for a future deployment. Destroying the bootstrap state bucket requires removing its `prevent_destroy` guard and emptying all object versions first.
