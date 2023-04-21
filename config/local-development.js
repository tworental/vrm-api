module.exports = {
  frontend: {
    app: {
      endpoint: `http://${process.env.FRONTEND_APP_DOMAIN}`,
    },
    owners: {
      endpoint: `http://${process.env.FRONTEND_OWNERS_DOMAIN}`,
    },
  },
  logger: {
    level: 'info',
    formats: [
      'timestamp',
      'prettyPrint',
    ],
  },
  mobile: {
    debug: true,
  },
  mailing: {
    sandbox: true,
    preview: true,
  },
}
