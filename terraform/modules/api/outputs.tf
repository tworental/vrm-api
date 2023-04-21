output "s3_storage_bucket_id" {
  value = module.storage.bucket_id
}

output "ecr_repository_url" {
  value = module.ecr.repository_url
}

output "subnets" {
  value = module.subnets
}

output "vpc" {
  value = module.vpc
}

output "alb" {
  value = module.alb
}

output "ecs_alb_service_task" {
  value = module.ecs_alb_service_task
}

output "rds" {
  value = module.rds
}
