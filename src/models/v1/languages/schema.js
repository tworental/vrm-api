exports.TRANSLATE_SCHEMA = {
  type: 'object',
  required: [
    'text',
    'to',
  ],
  properties: {
    text: {
      type: 'string',
      minLength: 1,
      transform: ['trim'],
    },
    to: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
      transform: ['trim'],
    },
  },
}
