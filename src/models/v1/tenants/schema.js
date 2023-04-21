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
