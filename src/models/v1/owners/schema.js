const { GENDERS, DOCUMENT_TYPES } = require('./constants')
const { UPDATE_SCHEMA: SETTINGS_SCHEMA } = require('../owner-settings/schema')

const CURRENT_DATE = new Date().toISOString().slice(0, 10)

const SCHEMA = {
  type: 'object',
  properties: {
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
    agencyCommission: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      transform: ['trim'],
    },
    hasPanelAccess: {
      type: 'number',
      enum: [0, 1],
    },
    notes: {
      type: 'string',
      transform: ['trim'],
    },
    gender: {
      type: 'string',
      enum: Object.values(GENDERS),
    },
    birthDate: {
      type: 'string',
      format: 'date',
      formatMaximum: CURRENT_DATE,
    },
    citizenship: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
      transform: ['trim'],
    },
    residence: {
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
    units: {
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      items: {
        type: 'integer',
      },
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'email',
    'phoneNumber',
    'firstName',
    'lastName',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA

exports.INVITATION_SCHEMA = {
  type: 'object',
  required: [
    'email',
  ],
  properties: {
    email: SCHEMA.properties.email,
  },
}

exports.UPDATE_ME_SCHEMA = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 191,
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
    parlance: {
      type: 'array',
      items: {
        type: 'string',
        transform: ['trim'],
        minLength: 2,
        maxLength: 2,
      },
    },
    avatar: {
      type: 'string',
      transform: ['trim'],
    },
    ...SETTINGS_SCHEMA.properties,
  },
}
