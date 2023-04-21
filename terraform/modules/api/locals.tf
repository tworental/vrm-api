locals {
  secrets = [
    {
      name  = "EXCHANGE_RATES_API_KEY"
      value = "/${var.environment}/${var.namespace}/shared/EXCHANGE_RATES_API_KEY"
    },
    {
      name  = "SENTRY_DSN"
      value = "/${var.environment}/${var.namespace}/shared/SENTRY_DSN"
    },
    {
      name  = "CHANNEX_API_KEY"
      value = "/${var.environment}/${var.namespace}/${var.stage}/CHANNEX_API_KEY"
    },
    {
      name  = "JWT_USER_SECRET"
      value = "/${var.environment}/${var.namespace}/${var.stage}/JWT_USER_SECRET"
    },
    {
      name  = "JWT_OWNER_SECRET"
      value = "/${var.environment}/${var.namespace}/${var.stage}/JWT_OWNER_SECRET"
    },
    {
      name  = "JWT_TENANT_SECRET"
      value = "/${var.environment}/${var.namespace}/${var.stage}/JWT_TENANT_SECRET"
    },
    {
      name  = "STRIPE_CLIENT_ID"
      value = "/${var.environment}/${var.namespace}/${var.stage}/STRIPE_CLIENT_ID"
    },
    {
      name  = "STRIPE_PUBLISHABLE_KEY"
      value = "/${var.environment}/${var.namespace}/${var.stage}/STRIPE_PUBLISHABLE_KEY"
    },
    {
      name  = "STRIPE_SECRET_KEY"
      value = "/${var.environment}/${var.namespace}/${var.stage}/STRIPE_SECRET_KEY"
    },
    {
      name  = "STRIPE_WEBHOOK_SECRET"
      value = "/${var.environment}/${var.namespace}/${var.stage}/STRIPE_WEBHOOK_SECRET"
    },
    {
      name  = "GOOGLE_MAPS_API_KEY"
      value = "/${var.environment}/${var.namespace}/${var.stage}/GOOGLE_MAPS_API_KEY"
    },
    {
      name  = "GOOGLE_TRANSLATE_API_KEY"
      value = "/${var.environment}/${var.namespace}/${var.stage}/GOOGLE_TRANSLATE_API_KEY"
    },
    {
      name  = "GOOGLE_CLIENT_ID"
      value = "/${var.environment}/${var.namespace}/${var.stage}/GOOGLE_CLIENT_ID"
    },
    {
      name  = "GOOGLE_CLIENT_SECRET"
      value = "/${var.environment}/${var.namespace}/${var.stage}/GOOGLE_CLIENT_SECRET"
    },
    {
      name  = "VONAGE_API_KEY"
      value = "/${var.environment}/${var.namespace}/${var.stage}/VONAGE_API_KEY"
    },
    {
      name  = "VONAGE_API_SECRET"
      value = "/${var.environment}/${var.namespace}/${var.stage}/VONAGE_API_SECRET"
    },
    {
      name  = "AWS_ACCESS_KEY_ID"
      value = "/${var.environment}/${var.namespace}/${var.stage}/AWS_ACCESS_KEY_ID"
    },
    {
      name  = "AWS_SECRET_ACCESS_KEY"
      value = "/${var.environment}/${var.namespace}/${var.stage}/AWS_SECRET_ACCESS_KEY"
    }
  ]

  prefix = join("-", [var.namespace, var.environment, var.stage, var.name])

  rds = {
    character_set_server : "utf8mb4",
    character_set_client : "utf8mb4",
    character_set_connection : "utf8mb4",
    character_set_results : "utf8mb4",
    collation_server : "utf8mb4_bin",
    collation_connection : "utf8mb4_bin",
    init_connect : "SET NAMES utf8mb4;"
  }

  ip_blacklist = ["45.146.165.123"]
}
