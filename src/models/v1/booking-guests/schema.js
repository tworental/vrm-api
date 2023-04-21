const { VAT_TYPES } = require('./constants')

const SCHEMA = {
  type: 'object',
  properties: {
    guestId: {
      type: 'integer',
      minimum: 1,
    },
    vatType: {
      type: 'string',
      enum: Object.values(VAT_TYPES),
    },
    notes: {
      type: 'string',
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'guestId',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
