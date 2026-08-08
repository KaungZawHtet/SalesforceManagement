output "alb_url" {
  description = "Public application URL."
  value       = module.alb.url
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name."
  value       = module.alb.dns_name
}

output "frontend_ecr_repository_url" {
  description = "Frontend ECR repository URL."
  value       = module.ecr.frontend_repository_url
}

output "backend_ecr_repository_url" {
  description = "Backend ECR repository URL."
  value       = module.ecr.backend_repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = module.ecs.cluster_name
}

output "frontend_service_name" {
  description = "Frontend ECS service name."
  value       = module.ecs.frontend_service_name
}

output "backend_service_name" {
  description = "Backend ECS service name."
  value       = module.ecs.backend_service_name
}

output "frontend_task_definition_family" {
  description = "Frontend ECS task definition family."
  value       = module.ecs.frontend_task_definition_family
}

output "backend_task_definition_family" {
  description = "Backend ECS task definition family."
  value       = module.ecs.backend_task_definition_family
}

output "client_id_secret_arn" {
  description = "Salesforce client ID secret ARN."
  value       = module.secrets.client_id_arn
}

output "client_secret_arn" {
  description = "Salesforce client secret ARN."
  value       = module.secrets.client_secret_arn
}
