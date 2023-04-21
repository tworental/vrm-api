const { domains } = require('disposable-email-provider-domains')

module.exports = {
  debug: {
    enabled: false,
  },
  errorHandler: {
    reporting: true,
    mask: true,
    trace: false,
  },
  mailing: {
    sandbox: false,
  },
  blacklist: {
    ips: [],
    emails: domains,
  },
  aws: {
    sqs: {
      reminderSmsQueue: 'api-tworentals-prod-app-reminder-sms',
      reminderEmailsQueue: 'api-tworentals-prod-app-reminder-emails',
    },
  },
}
