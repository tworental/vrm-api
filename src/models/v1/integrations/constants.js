exports.TABLE_NAME = 'integrations'

exports.STRIPE_MAP = Object.freeze({
  WHITE_LABEL: 'prod_ILxTeDYTPoW8s2',
  PRIVATE_LABEL: null,
})

exports.INTEGRATIONS = Object.freeze({
  MAILCHIMP: 'mailchimp',
})

exports.LISTENERS = Object.freeze({
  INTEGRATIONS_UPDATE: 'update:integration',
})
