const SCHEMA = {
  type: 'object',
  properties: {
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
    email: {
      type: 'string',
      format: 'email',
      minLength: 5,
      maxLength: 191,
      transform: ['trim', 'toLowerCase'],
    },
    primaryPhoneNumber: {
      type: 'string',
      minLength: 5,
      maxLength: 40,
      nullable: true,
      transform: ['trim'],
    },
    additionalPhoneNumber: {
      type: 'string',
      minLength: 5,
      maxLength: 40,
      nullable: true,
      transform: ['trim'],
    },
    parlance: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 2,
        maxLength: 2,
      },
    },
    website: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
    bio: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'firstName',
    'lastName',
    'email',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
