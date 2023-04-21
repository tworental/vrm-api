terraform {
  required_version = "0.14.11"

  backend "s3" {
    bucket  = "terraform-infra-state-tworentals-us-east-1"
    region  = "us-east-1"
    key     = "tworentals/v1/aws/backend.tfstate"
    encrypt = true

    dynamodb_table = "terraform-lock-state"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.7"
    }
  }
}

module "staging" {
  source = "./environments/staging"

  name        = var.name
  namespace   = var.namespace
  region      = var.region
  label_order = var.label_order
  tags        = var.tags

  subdomain        = "api"
  hosted_zone_name = "tworentals.dev"
}

module "prod" {
  source = "./environments/prod"

  name        = var.name
  namespace   = var.namespace
  region      = var.region
  label_order = var.label_order
  tags        = var.tags

  subdomain        = "api"
  hosted_zone_name = "tworentals.com"
}
