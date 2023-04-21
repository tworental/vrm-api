locals {
  environments = [
    {
      name : "NODE_ENV",
      value : "production"
    },
    {
      name : "DEFAULT_CURRENCY",
      value : "EUR"
    },
    {
      name : "STRIPE_ACCOUNT_COUNTRY",
      value : "EE"
    },
    {
      name : "CHANNEX_URL",
      value : "https://app.channex.io"
    },
    {
      name : "FRONTEND_OWNERS_DOMAIN",
      value : "tworentalsowners.com"
    },
    {
      name : "PRIVATE_LABEL_ID",
      value : var.environment
    },
    {
      name : "FRONTEND_APP_DOMAIN",
      value : var.hosted_zone_name
    },
    {
      name : "API_DOMAIN",
      value : "${var.subdomain}.${var.hosted_zone_name}"
    },
    {
      name : "EMAIL_FROM",
      value : "no-reply@${var.hosted_zone_name}"
    },
    {
      name : "GOOGLE_REDIRECT_URI",
      value : "https://app.${var.hosted_zone_name}/auth/oauth2"
    }
  ]
}
