resource "aws_ssm_parameter" "database_password" {
  name  = "/${var.environment}/${var.namespace}/${var.stage}/DATABASE_PASS"
  type  = "SecureString"
  value = random_password.password.result
  tags  = var.tags
}
