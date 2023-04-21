const { RATE_TYPES, CHARGE_TYPE, FREQUENCIES } = require('./constants')

const SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
    description: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
    rateType: {
      type: 'string',
      enum: Object.values(RATE_TYPES),
    },
    percentage: {
      type: 'number',
      nullable: true,
      minimum: 0,
      maximum: 100,
    },
    currency: {
      type: 'string',
      nullable: true,
      minLength: 3,
      maxLength: 3,
      transform: ['trim'],
    },
    amount: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    chargeType: {
      type: 'string',
      nullable: true,
      enum: Object.values(CHARGE_TYPE),
    },
    frequency: {
      type: 'string',
      nullable: true,
      enum: Object.values(FREQUENCIES),
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'name',
    'rateType',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
