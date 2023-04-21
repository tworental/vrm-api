const {
  GENDERS, TITLES, TYPES, DOCUMENT_TYPES,
} = require('./constants')

const CURRENT_DATE = new Date().toISOString().slice(0, 10)

const SCHEMA = {
  type: 'object',
  properties: {
    companyId: {
      type: 'integer',
      minimum: 1,
    },
    email: {
      type: 'string',
      format: 'email',
      minLength: 5,
      maxLength: 191,
      transform: ['trim', 'toLowerCase'],
    },
    type: {
      type: 'string',
      enum: Object.values(TYPES),
    },
    phoneNumber: {
      type: 'string',
      minLength: 5,
      maxLength: 40,
      transform: ['trim'],
    },
    firstName: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      transform: ['trim'],
    },
    lastName: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      transform: ['trim'],
    },
    title: {
      type: 'string',
      enum: Object.values(TITLES),
    },
    gender: {
      type: 'string',
      enum: Object.values(GENDERS),
    },
    birthDate: {
      type: 'string',
      format: 'date',
      transform: ['trim'],
    },
    birthPlace: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
    citizenship: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
    },
    address: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
    city: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
    zip: {
      type: 'string',
      maxLength: 40,
      transform: ['trim'],
    },
    region: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
    countryCode: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
      transform: ['trim'],
    },
    documentType: {
      type: 'string',
      enum: Object.values(DOCUMENT_TYPES),
    },
    documentNumber: {
      type: 'string',
      transform: ['trim'],
    },
    documentIssuedDate: {
      type: 'string',
      format: 'date',
      formatMaximum: CURRENT_DATE,
    },
    documentExpiryDate: {
      type: 'string',
      format: 'date',
      formatMinimum: CURRENT_DATE,
    },
    parlance: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 2,
        maxLength: 2,
      },
    },
    labels: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
          },
        },
      },
    },
    notes: {
      type: 'string',
      transform: ['trim'],
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'phoneNumber',
    'firstName',
    'lastName',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
