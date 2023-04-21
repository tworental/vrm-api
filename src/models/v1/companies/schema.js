const { TYPES, DISCOUNT_TYPES } = require('./constants')

const SCHEMA = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: Object.values(TYPES),
    },
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
    registrationNumber: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      transform: ['trim'],
    },
    vatId: {
      type: 'string',
      isValidVAT: true,
      transform: ['trim'],
    },
    taxId: {
      type: 'string',
      maxLength: 60,
      transform: ['trim'],
    },
    address: {
      type: 'string',
      maxLength: 191,
      transform: ['trim'],
    },
    zip: {
      type: 'string',
      maxLength: 40,
      transform: ['trim'],
    },
    city: {
      type: 'string',
      maxLength: 100,
      transform: ['trim'],
    },
    countryCode: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
      transform: ['trim'],
    },
    email: {
      type: 'string',
      format: 'email',
      minLength: 5,
      maxLength: 191,
      transform: ['trim', 'toLowerCase'],
    },
    phoneNumber: {
      type: 'string',
      minLength: 5,
      maxLength: 40,
      transform: ['trim'],
    },
    bankName: {
      type: 'string',
      maxLength: 100,
      transform: ['trim'],
    },
    bankIban: {
      type: 'string',
      maxLength: 50,
      isValidIBAN: true,
      transform: ['trim'],
    },
    bankBic: {
      type: 'string',
      maxLength: 20,
      isValidBIC: true,
      transform: ['trim'],
    },
    discountType: {
      type: 'string',
      enum: Object.values(DISCOUNT_TYPES),
    },
    discountValue: {
      type: 'number',
    },
    labels: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'name',
        ],
        properties: {
          name: {
            type: 'string',
            transform: ['trim'],
          },
        },
      },
    },
    notes: {
      type: 'string',
      transform: ['trim'],
    },
    isActive: {
      type: 'integer',
      enum: [0, 1],
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'name',
    'type',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
