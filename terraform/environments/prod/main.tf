module "api" {
  source = "../../modules/api"

  name        = var.name
  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  region      = var.region
  label_order = var.label_order
  tags        = var.tags

  route53_subdomain        = var.subdomain
  route53_hosted_zone_name = var.hosted_zone_name

  s3_versioning_enabled      = true
  s3_force_destroy           = false
  s3_restrict_public_buckets = false
  s3_ignore_public_acls      = false

  rds_apply_immediately       = false
  rds_skip_final_snapshot     = true
  rds_deletion_protection     = true
  rds_storage_encrypted       = true
  rds_multi_az                = true
  rds_storage_type            = "gp2"
  rds_instance_class          = "db.t2.medium"
  rds_allocated_storage       = 10
  rds_backup_retention_period = 7
  rds_monitoring_interval     = "60"
  cidr_block                  = "10.0.1.0/24"

  alb_access_logs_enabled = true

  cloudwatch_retention_in_days = 7

  ecs_environments            = local.environments
  ecs_assign_public_ip        = true
  ecs_enable_ecs_managed_tags = true
  ecs_autoscaling_enabled     = true
  ecs_task_cpu                = 512
  ecs_task_memory             = 1024
  ecs_min_capacity            = 1
  ecs_max_capacity            = 1
}

module "bastion" {
  source  = "cloudposse/ec2-bastion-server/aws"
  version = "0.28.3"

  name        = "bastion"
  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  label_order = var.label_order
  tags        = var.tags

  key_name      = "bastion"
  instance_type = "t2.micro"

  vpc_id                      = module.api.vpc.vpc_id
  subnets                     = module.api.subnets.public_subnet_ids
  security_groups             = [module.api.vpc.vpc_default_security_group_id]
  associate_public_ip_address = true

  security_group_rules = [
    {
      "cidr_blocks" : ["0.0.0.0/0"],
      "from_port" : 0,
      "to_port" : 0,
      "protocol" : -1,
      "type" : "egress"
    },
    {
      "cidr_blocks" : ["0.0.0.0/0"],
      "from_port" : 3306,
      "to_port" : 3306,
      "protocol" : "tcp",
      "type" : "egress"
    },
    {
      "cidr_blocks" : ["0.0.0.0/0"],
      "from_port" : 22,
      "to_port" : 22,
      "protocol" : "tcp",
      "type" : "ingress"
    }
  ]
}
