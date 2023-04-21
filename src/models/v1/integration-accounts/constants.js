exports.TABLE_NAME = 'integration_accounts'

exports.MAILCHIMP_SCHEMA = {
  type: 'object',
  required: ['apiKey', 'server'],
  properties: {
    apiKey: {
      type: 'string',
      minLength: 4,
      maxLength: 191,
      transform: ['trim'],
    },
    server: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
  },
}
