data "aws_caller_identity" "current" {}

data "aws_route53_zone" "this" {
  name = var.route53_hosted_zone_name
}

data "aws_acm_certificate" "this" {
  domain   = trimsuffix(var.route53_hosted_zone_name, ".")
  statuses = ["ISSUED"]
}
