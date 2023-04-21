const SCHEMA = {
  type: 'object',
  properties: {
    invoiceNoPattern: {
      type: 'string',
      maxLength: 40,
      transform: ['trim'],
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'invoiceNoPattern',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
