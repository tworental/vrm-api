const SCHEMA = {
  type: 'object',
  properties: {
    timezone: {
      type: 'string',
      maxLength: 50,
      transform: ['trim'],
    },
    locale: {
      type: 'string',
      minLength: 2,
      maxLength: 6,
      transform: ['trim'],
    },
    language: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
      transform: ['trim'],
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'timezone',
    'locale',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
