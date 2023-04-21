const { CREATE_SCHEMA: CREATE_USER_SCHEMA } = require('../users/schema')
const { CREATE_SCHEMA: CREATE_USER_SETTINGS_SCHEMA } = require('../user-settings/schema')

const { UPDATE_SCHEMA: UPDATE_ACCOUNT_SETTINGS_SCHEMA } = require('../account-settings/schema')

const SCHEMA = {
  type: 'object',
  properties: {
    packageId: {
      type: 'integer',
      minimum: 1,
    },
    identifier: {
      type: 'string',
      minLength: 4,
      maxLength: 30,
      transform: ['trim'],
    },
    domain: {
      type: 'string',
      minLength: 4,
      maxLength: 191,
      transform: ['trim'],
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 191,
    },
    ...CREATE_USER_SCHEMA.properties,
    ...CREATE_USER_SETTINGS_SCHEMA.properties,
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'identifier',
    'password',
    ...CREATE_USER_SCHEMA.required,
    ...CREATE_USER_SETTINGS_SCHEMA.required,
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = {
  type: 'object',
  properties: {
    domain: {
      type: 'string',
      minLength: 4,
      maxLength: 191,
      transform: ['trim'],
    },
    companyName: {
      type: 'string',
      maxLength: 191,
      transform: ['trim'],
    },
    companyAddress: {
      type: 'string',
      nullable: true,
      maxLength: 191,
      transform: ['trim'],
    },
    companyZip: {
      type: 'string',
      maxLength: 40,
      transform: ['trim'],
    },
    companyCity: {
      type: 'string',
      maxLength: 100,
      transform: ['trim'],
    },
    companyCountry: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
      transform: ['trim'],
    },
    companyVatId: {
      type: 'string',
      isValidVAT: true,
      nullable: true,
      transform: ['trim'],
    },
    ...UPDATE_ACCOUNT_SETTINGS_SCHEMA.properties,
  },
}
