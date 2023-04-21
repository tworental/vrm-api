const { UPDATE_SCHEMA: SETTINGS_SCHEMA } = require('../user-settings/schema')
const { ABILITIES, PERMISSIONS } = require('../permissions/constants')

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
    ...SETTINGS_SCHEMA.properties,
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

exports.UPDATE_SCHEMA = {
  type: 'object',
  properties: {
    isAccountOwner: {
      type: 'integer',
      enum: [0, 1],
    },
    permissions: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'name',
          'abilities',
        ],
        properties: {
          name: {
            type: 'string',
            enum: Object.values(PERMISSIONS),
          },
          abilities: {
            type: 'array',
            maxItems: 3,
            uniqueItems: true,
            nullable: true,
            items: {
              type: 'string',
              enum: Object.values(ABILITIES),
            },
          },
        },
      },
    },
  },
}

exports.INVITATION_SCHEMA = {
  type: 'object',
  required: [
    'email',
  ],
  properties: {
    email: SCHEMA.properties.email,
    permissions: exports.UPDATE_SCHEMA.properties.permissions,
  },
}

exports.UPDATE_ME_SCHEMA = {
  type: 'object',
  properties: {
    ...SCHEMA.properties,
    oauth2GoogleId: {
      type: 'string',
    },
    avatar: {
      type: 'string',
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 191,
    },
  },
}
