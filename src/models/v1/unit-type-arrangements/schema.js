const { PRIVACY } = require('./constants')
const { TYPE } = require('../dict-arrangements/constants')

exports.SCHEMA = {
  type: 'object',
  required: [
    'dictArrangementId',
    'privacy',
    'type',
  ],
  properties: {
    dictArrangementId: {
      type: 'integer',
      minimum: 1,
    },
    count: {
      type: 'integer',
      default: 1,
    },
    privacy: {
      type: 'string',
      enum: Object.values(PRIVACY),
    },
    type: {
      type: 'string',
      enum: Object.values(TYPE),
    },
  },
}
