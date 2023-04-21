module.exports = {
  environment: process.env.NODE_ENV,
  releaseId: process.env.RELEASE_ID || null,
  server: {
    port: 3000,
    keepAliveTimeout: 61 * 1000, // 61 seconds in miliseconds, needs to be higher than the idle timeout of the alb, see https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
    headersTimeout: 62 * 1000, // 62 seconds in miliseconds, needs to be higher than the keepAliveTimemout, see https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
    locationPrefix: '/v1/',
  },
  debug: {
    enabled: true,
    key: 'X-Debug-Data',
  },
  privateLabel: process.env.PRIVATE_LABEL_ID,
  api: {
    domain: process.env.API_DOMAIN,
  },
  frontend: {
    app: {
      endpoint: `https://%s.${process.env.FRONTEND_APP_DOMAIN}`,
      paths: {
        accountConfirmation: '/auth/confirmation',
        changePassword: '/auth/change-password',
        resetPassword: '/auth/forgot-password',
        billing: '/billing/overview',
        checkoutSuccess: '/billing/checkout/success?sessionId={CHECKOUT_SESSION_ID}',
        checkoutCancel: '/billing/',
        oauthGoogle: '/auth/oauth/callback',
        oauthGoogleConnect: '/account',
      },
    },
    owners: {
      endpoint: `https://%s.${process.env.FRONTEND_OWNERS_DOMAIN}`,
      paths: {
        accountConfirmation: '/auth/confirmation',
        changePassword: '/auth/change-password',
        resetPassword: '/auth/forgot-password',
      },
    },
  },
  sentryDsn: process.env.SENTRY_DSN,
  errorHandler: {
    reporting: true,
    trace: true,
    mask: true,
  },
  logger: {
    level: 'info',
    formats: ['timestamp', 'json'],
  },
  locales: {
    defaultLangCode: 'en',
    availableLanguages: ['en'],
  },
  guards: {
    user: {
      roleName: 'agency',
      secret: process.env.JWT_USER_SECRET,
      accessTokenTtl: 86400,
      refreshTokenTtl: 1728000,
    },
    owner: {
      roleName: 'owner',
      secret: process.env.JWT_OWNER_SECRET,
      accessTokenTtl: 86400,
      refreshTokenTtl: 1728000,
    },
    tenant: {
      roleName: 'tenant',
      secret: process.env.JWT_TENANT_SECRET,
      accessTokenTtl: 86400,
      refreshTokenTtl: 1728000,
    },
  },
  database: {
    client: 'mysql2',
    useNullAsDefault: true,
    timezone: 'UTC',
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASS,
      multipleStatements: true,
      charset: 'utf8mb4',
    },
  },
  payments: {
    trialPeriod: 7,
    defaultCurrency: process.env.DEFAULT_CURRENCY,
    stripe: {
      version: '2020-08-27',
      maxNetworkRetries: 5,
      country: process.env.STRIPE_ACCOUNT_COUNTRY || 'US',
      apiSecretKey: process.env.STRIPE_SECRET_KEY,
      apiPublicKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },
  google: {
    oauth: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirect: process.env.GOOGLE_REDIRECT_URI,
    },
    maps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
    translate: {
      apiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
    },
  },
  mobile: {
    debug: false,
    vonage: {
      brand: 'TwoRentals',
      from: 'TwoRentals',
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
    },
  },
  exchangeRatesApi: {
    url: 'http://data.fixer.io/v1/',
    apiKey: process.env.EXCHANGE_RATES_API_KEY,
  },
  channex: {
    url: process.env.CHANNEX_URL,
    credentials: {
      apiKey: process.env.CHANNEX_API_KEY,
    },
  },
  slack: {
    token: process.env.SLACK_TOKEN || null,
    channels: {
      signupOrders: 'C024YL6BCKD',
    },
  },
  mailing: {
    from: {
      name: 'TwoRentals',
      email: process.env.EMAIL_FROM,
    },
    content: {
      homePageUrl: `https://www.${process.env.FRONTEND_APP_DOMAIN}`,
      companyInfo: 'Dakicksoft OÜ (registered company no. 14327696) of Sepapaja 6, Tallinn 15551, Estonia',
    },
    sandbox: false,
    preview: false,
  },
  aws: {
    region: process.env.AWS_REGION,
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    accessSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      storage: process.env.S3_STORAGE_BUCKET,
    },
    sqs: {
      reminderSmsQueue: 'api-tworentals-staging-app-reminder-sms',
      reminderEmailsQueue: 'api-tworentals-staging-app-reminder-emails',
    },
  },
  validation: {
    $data: true,
    allErrors: true,
    useDefaults: true,
    coerceTypes: true,
    removeAdditional: 'all',
    additionalProperties: false,
  },
  blacklist: {
    ips: [],
    emails: [],
  },
}
