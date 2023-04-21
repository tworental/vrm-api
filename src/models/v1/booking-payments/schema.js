const { PAYMENT_TYPES } = require('./constants')

const SCHEMA = {
  type: 'object',
  properties: {
    amount: {
      type: 'number',
      minimum: 0,
    },
    currency: {
      type: 'string',
      minLength: 3,
      maxLength: 3,
      transform: ['trim'],
    },
    currencyRate: {
      type: 'number',
      minimum: 0,
    },
    paymentType: {
      type: 'string',
      enum: Object.values(PAYMENT_TYPES),
    },
    paymentDate: {
      type: 'string',
      // format: 'date-time',
    },
    notes: {
      type: 'string',
      transform: ['trim'],
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'amount',
    'currency',
    'paymentType',
    'paymentDate',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
