data "aws_caller_identity" "current" {}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

module "network" {
  source = "../../modules/network"

  name               = local.name_prefix
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  tags               = local.tags
}

module "ecr" {
  source = "../../modules/ecr"

  name = local.name_prefix
  tags = local.tags
}

module "secrets" {
  source = "../../modules/secrets"

  name = local.name_prefix
  tags = local.tags
}

module "observability" {
  source = "../../modules/observability"

  name               = local.name_prefix
  log_retention_days = var.log_retention_days
  tags               = local.tags
}

module "alb" {
  source = "../../modules/alb"

  name                 = local.name_prefix
  vpc_id               = module.network.vpc_id
  public_subnet_ids    = module.network.public_subnet_ids
  security_group_id    = module.network.alb_security_group_id
  frontend_port        = 3001
  backend_port         = 3000
  frontend_health_path = "/"
  backend_health_path  = "/api/health"
  tags                 = local.tags
}

module "ecs" {
  source = "../../modules/ecs"

  name                         = local.name_prefix
  aws_region                   = var.aws_region
  vpc_id                       = module.network.vpc_id
  private_subnet_ids           = module.network.private_subnet_ids
  frontend_security_group_id   = module.network.frontend_security_group_id
  backend_security_group_id    = module.network.backend_security_group_id
  frontend_target_group_arn    = module.alb.frontend_target_group_arn
  backend_target_group_arn     = module.alb.backend_target_group_arn
  frontend_image               = var.frontend_image
  backend_image                = var.backend_image
  frontend_cpu                 = var.frontend_cpu
  frontend_memory              = var.frontend_memory
  backend_cpu                  = var.backend_cpu
  backend_memory               = var.backend_memory
  desired_count                = var.desired_count
  frontend_repository_url      = module.ecr.frontend_repository_url
  backend_repository_url       = module.ecr.backend_repository_url
  frontend_log_group_name      = module.observability.frontend_log_group_name
  backend_log_group_name       = module.observability.backend_log_group_name
  salesforce_login_url         = var.salesforce_login_url
  salesforce_api_version       = var.salesforce_api_version
  cors_origin                  = module.alb.url
  salesforce_client_id_arn     = var.salesforce_client_id_secret_arn != "" ? var.salesforce_client_id_secret_arn : module.secrets.client_id_arn
  salesforce_client_secret_arn = var.salesforce_client_secret_arn != "" ? var.salesforce_client_secret_arn : module.secrets.client_secret_arn
  salesforce_secrets_ready     = var.salesforce_secrets_ready
  enable_container_insights    = var.enable_container_insights
  tags                         = local.tags
}
