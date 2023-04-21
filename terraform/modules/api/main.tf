resource "random_password" "password" {
  length           = 30
  special          = true
  min_special      = 4
  override_special = "!#^&*()-_=+[]{}<>:?"
  keepers = {
    pass_version = 1
  }
}

module "storage" {
  source  = "cloudposse/s3-bucket/aws"
  version = "0.43.0"

  name        = var.s3_storage_name
  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  attributes  = [var.region]
  label_order = var.label_order
  tags        = var.tags

  block_public_acls       = var.s3_block_public_acls
  block_public_policy     = var.s3_block_public_policy
  ignore_public_acls      = var.s3_ignore_public_acls
  allowed_bucket_actions  = var.s3_allowed_bucket_actions
  versioning_enabled      = var.s3_versioning_enabled
  force_destroy           = var.s3_force_destroy
  restrict_public_buckets = var.s3_restrict_public_buckets
}

module "vpc" {
  source  = "cloudposse/vpc/aws"
  version = "0.27.0"

  cidr_block = var.cidr_block

  name        = var.name
  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  label_order = var.label_order
  tags        = var.tags
}

module "subnets" {
  source  = "cloudposse/dynamic-subnets/aws"
  version = "0.39.3"

  name        = var.name
  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  label_order = var.label_order
  tags        = var.tags

  vpc_id     = module.vpc.vpc_id
  igw_id     = module.vpc.igw_id
  cidr_block = module.vpc.vpc_cidr_block

  availability_zones = var.availability_zones
}

module "alb" {
  source  = "cloudposse/alb/aws"
  version = "0.35.3"

  name        = var.name
  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  label_order = var.label_order
  tags        = var.tags

  vpc_id             = module.vpc.vpc_id
  security_group_ids = [module.vpc.vpc_default_security_group_id]
  subnet_ids         = module.subnets.public_subnet_ids
  certificate_arn    = data.aws_acm_certificate.this.arn

  http_redirect       = var.alb_http_redirect
  https_enabled       = var.alb_https_enabled
  https_ssl_policy    = var.alb_https_ssl_policy
  access_logs_enabled = var.alb_access_logs_enabled
  health_check_path   = var.health_check_path
  target_group_port   = var.ecs_container_port
  target_group_name   = "${var.environment}-${var.namespace}-${var.stage}-tg"
}

module "rds" {
  source  = "cloudposse/rds/aws"
  version = "0.37.0"

  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  label_order = var.label_order
  tags        = var.tags

  subnet_ids          = module.subnets.private_subnet_ids
  vpc_id              = module.vpc.vpc_id
  allowed_cidr_blocks = module.subnets.private_subnet_cidrs
  security_group_ids  = [module.vpc.vpc_default_security_group_id]

  database_name     = var.rds_database_name
  database_user     = var.rds_database_user
  database_password = random_password.password.result
  database_port     = var.rds_database_port

  engine               = var.rds_engine
  engine_version       = var.rds_engine_version
  major_engine_version = var.rds_major_engine_version
  instance_class       = var.rds_instance_class
  db_parameter_group   = var.rds_db_parameter_group
  allocated_storage    = var.rds_allocated_storage
  storage_encrypted    = var.rds_storage_encrypted

  multi_az            = var.rds_multi_az
  apply_immediately   = var.rds_apply_immediately
  skip_final_snapshot = var.rds_skip_final_snapshot
  deletion_protection = var.rds_deletion_protection

  backup_retention_period = var.rds_backup_retention_period

  db_parameter = [for key, value in local.rds : {
    name         = key,
    value        = value,
    apply_method = "immediate"
  }]
}

module "ecr" {
  source  = "cloudposse/ecr/aws"
  version = "0.32.3"

  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  label_order = var.label_order
  tags        = var.tags

  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_lifecycle_policy" "this" {
  repository = module.ecr.repository_name

  policy = file("${path.module}/policies/ecr-policies.json")
}

module "cloudwatch" {
  source  = "cloudposse/cloudwatch-logs/aws"
  version = "0.5.0"

  name        = var.name
  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  label_order = var.label_order
  tags        = var.tags

  retention_in_days = var.cloudwatch_retention_in_days
  stream_names      = var.cloudwatch_stream_names
}

resource "aws_ecs_cluster" "default" {
  name = "${var.environment}-${var.stage}"
  tags = var.tags

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

module "ecs_container_definition" {
  source  = "cloudposse/ecs-container-definition/aws"
  version = "0.58.1"

  container_name  = "${var.environment}-${var.namespace}-${var.stage}"
  container_image = "${module.ecr.repository_url}:latest"

  environment = concat(var.ecs_environments, [
    {
      name : "S3_STORAGE_BUCKET"
      value : module.storage.bucket_id
    },
    {
      name : "DATABASE_USER"
      value : var.rds_database_user
    },
    {
      name : "DATABASE_NAME"
      value : var.rds_database_name
    },
    {
      name : "DATABASE_PORT"
      value : var.rds_database_port
    },
    {
      name : "DATABASE_HOST"
      value : module.rds.instance_address
    }
  ])

  secrets = [for item in concat(local.secrets, [
    {
      name : "DATABASE_PASS"
      value : "/${var.environment}/${var.namespace}/${var.stage}/DATABASE_PASS"
    }
    ]) : {
    "name" : item.name,
    "valueFrom" : join("", ["arn:aws:ssm:${var.region}:${data.aws_caller_identity.current.account_id}:parameter", item.value])
  }]

  port_mappings = [
    {
      containerPort = var.ecs_container_port
      hostPort      = var.ecs_container_port
      protocol      = "tcp"
    }
  ]

  log_configuration = {
    "logDriver" : "awslogs",
    "options" : {
      "awslogs-group" : module.cloudwatch.log_group_name,
      "awslogs-create-group" : true,
      "awslogs-stream-prefix" : "ecs",
      "awslogs-region" : var.region
    }
  }
}

module "ecs_alb_service_task" {
  source  = "cloudposse/ecs-alb-service-task/aws"
  version = "0.55.1"

  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  label_order = var.label_order
  tags        = var.tags

  vpc_id                    = module.vpc.vpc_id
  subnet_ids                = module.subnets.public_subnet_ids
  security_group_ids        = [module.vpc.vpc_default_security_group_id]
  alb_security_group        = module.vpc.vpc_default_security_group_id
  container_definition_json = module.ecs_container_definition.json_map_encoded_list
  ecs_cluster_arn           = aws_ecs_cluster.default.arn

  use_alb_security_group            = var.ecs_use_alb_security_group
  assign_public_ip                  = var.ecs_assign_public_ip
  desired_count                     = var.ecs_desired_count
  container_port                    = var.ecs_container_port
  enable_ecs_managed_tags           = var.ecs_enable_ecs_managed_tags
  health_check_grace_period_seconds = var.ecs_health_check_grace_period_seconds
  task_memory                       = var.ecs_task_memory
  task_cpu                          = var.ecs_task_cpu
  task_exec_policy_arns             = ["arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"]

  ecs_load_balancers = [
    {
      container_name   = "${var.environment}-${var.namespace}-${var.stage}"
      container_port   = var.ecs_container_port
      elb_name         = ""
      target_group_arn = module.alb.default_target_group_arn
    }
  ]
}

module "ecs_cloudwatch_autoscaling" {
  source  = "cloudposse/ecs-cloudwatch-autoscaling/aws"
  version = "0.7.0"

  enabled = var.ecs_autoscaling_enabled

  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  label_order = var.label_order
  tags        = var.tags

  cluster_name = aws_ecs_cluster.default.id
  service_name = module.ecs_alb_service_task.service_name

  min_capacity          = var.ecs_min_capacity
  max_capacity          = var.ecs_max_capacity
  scale_up_adjustment   = var.ecs_scale_up_adjustment
  scale_up_cooldown     = var.ecs_scale_up_cooldown
  scale_down_adjustment = var.ecs_scale_down_adjustment
  scale_down_cooldown   = var.ecs_scale_down_cooldown
}

resource "aws_security_group_rule" "ingress" {
  type              = "ingress"
  from_port         = "0"
  to_port           = "0"
  protocol          = "-1"
  cidr_blocks       = [module.vpc.vpc_cidr_block]
  security_group_id = module.ecs_alb_service_task.service_security_group_id
}

module "route53-record" {
  source  = "clouddrove/route53-record/aws"
  version = "0.15.0"

  zone_id = data.aws_route53_zone.this.zone_id
  name    = var.route53_subdomain
  type    = "A"
  alias = {
    name                   = module.alb.alb_dns_name
    zone_id                = module.alb.alb_zone_id
    evaluate_target_health = false
  }
}

module "ses" {
  source  = "cloudposse/ses/aws"
  version = "0.20.0"

  stage       = var.stage
  environment = var.environment
  namespace   = var.namespace
  label_order = var.label_order
  tags        = var.tags

  domain            = trimsuffix(var.route53_hosted_zone_name, ".")
  zone_id           = data.aws_route53_zone.this.zone_id
  verify_dkim       = true
  verify_domain     = true
  ses_user_enabled  = false
  ses_group_enabled = false
}
