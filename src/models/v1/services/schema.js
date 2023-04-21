const { TYPES, CHARGE_TYPE } = require('./constants')

const SCHEMA = {
  type: 'object',
  properties: {
    serviceProviderId: {
      type: 'integer',
      nullable: true,
      minimum: 1,
    },
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
    duration: {
      type: 'integer',
      nullable: true,
      minimum: 0,
      maximum: 100000,
    },
    type: {
      type: 'string',
      enum: Object.values(TYPES),
    },
    description: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
    currency: {
      type: 'string',
      minLength: 3,
      maxLength: 3,
      transform: ['trim'],
    },
    amount: {
      type: 'number',
      minimum: 0,
    },
    chargeType: {
      type: 'string',
      enum: Object.values(CHARGE_TYPE),
    },
    taxIncluded: {
      type: 'integer',
      nullable: true,
      enum: [0, 1, null],
    },
    taxValue: {
      type: 'number',
      nullable: true,
      minimum: 0,
      maximum: 100,
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'name',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
