exports.VERIFICATION_SCHEMA = {
  type: 'object',
  properties: {
    phoneNumber: {
      type: 'string',
      minLength: 5,
      maxLength: 40,
    },
    code: {
      type: 'string',
      minLength: 4,
      maxLength: 4,
    },
    token: {
      type: 'string',
      minLength: 24,
      maxLength: 64,
      transform: ['trim'],
    },
  },
}
