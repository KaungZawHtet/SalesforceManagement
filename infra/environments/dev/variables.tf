variable "aws_region" {
  description = "AWS region for the demo environment."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used in resource names."
  type        = string
  default     = "salesforce-manager"
}

variable "environment" {
  description = "Environment name used in resource names and tags."
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the demo VPC."
  type        = string
  default     = "10.42.0.0/16"
}

variable "availability_zones" {
  description = "Two availability zones for public and private subnets."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]

  validation {
    condition     = length(var.availability_zones) == 2
    error_message = "Exactly two availability zones are required."
  }
}

variable "frontend_image" {
  description = "Initial frontend image. GitHub Actions replaces this with a commit SHA image."
  type        = string
  default     = "public.ecr.aws/docker/library/busybox:1.36"
}

variable "backend_image" {
  description = "Initial backend image. GitHub Actions replaces this with a commit SHA image."
  type        = string
  default     = "public.ecr.aws/docker/library/busybox:1.36"
}

variable "frontend_cpu" {
  description = "Frontend Fargate CPU units."
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Frontend Fargate memory in MiB."
  type        = number
  default     = 512
}

variable "backend_cpu" {
  description = "Backend Fargate CPU units."
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Backend Fargate memory in MiB."
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired task count for each ECS service."
  type        = number
  default     = 1
}

variable "log_retention_days" {
  description = "CloudWatch log retention period."
  type        = number
  default     = 7
}

variable "salesforce_client_id_secret_arn" {
  description = "Existing Secrets Manager ARN for the Salesforce client ID."
  type        = string
  default     = ""
}

variable "salesforce_client_secret_arn" {
  description = "Existing Secrets Manager ARN for the Salesforce client secret."
  type        = string
  default     = ""
}

variable "github_actions_role_arn" {
  description = "Existing GitHub Actions OIDC role ARN. Terraform does not manage this role."
  type        = string
  default     = ""
}

variable "salesforce_login_url" {
  description = "Salesforce OAuth login URL."
  type        = string
  default     = "https://login.salesforce.com"
}

variable "salesforce_api_version" {
  description = "Salesforce REST API version."
  type        = string
  default     = "60.0"
}

variable "enable_container_insights" {
  description = "Enable ECS Container Insights."
  type        = bool
  default     = false
}

variable "salesforce_secrets_ready" {
  description = "Whether the Salesforce secret containers have values and can be injected into ECS."
  type        = bool
  default     = false
}
