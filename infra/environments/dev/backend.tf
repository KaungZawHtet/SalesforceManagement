terraform {
  backend "s3" {
    bucket       = "salesforce-manager-terraform-state-123456789012"
    key          = "dev/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
