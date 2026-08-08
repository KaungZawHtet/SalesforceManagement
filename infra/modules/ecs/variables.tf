variable "name" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "frontend_security_group_id" {
  type = string
}

variable "backend_security_group_id" {
  type = string
}

variable "frontend_target_group_arn" {
  type = string
}

variable "backend_target_group_arn" {
  type = string
}

variable "frontend_image" {
  type = string
}

variable "backend_image" {
  type = string
}

variable "frontend_cpu" {
  type = number
}

variable "frontend_memory" {
  type = number
}

variable "backend_cpu" {
  type = number
}

variable "backend_memory" {
  type = number
}

variable "desired_count" {
  type = number
}

variable "frontend_repository_url" {
  type = string
}

variable "backend_repository_url" {
  type = string
}

variable "frontend_log_group_name" {
  type = string
}

variable "backend_log_group_name" {
  type = string
}

variable "salesforce_login_url" {
  type = string
}

variable "salesforce_api_version" {
  type = string
}

variable "cors_origin" {
  type = string
}

variable "salesforce_client_id_arn" {
  type = string
}

variable "salesforce_client_secret_arn" {
  type = string
}

variable "salesforce_secrets_ready" {
  type = bool
}

variable "enable_container_insights" {
  type = bool
}

variable "tags" {
  type    = map(string)
  default = {}
}
