const SCHEMA = {
  type: 'object',
  properties: {
    html: {
      type: 'string',
      nullable: false,
      transform: ['trim'],
    },
    css: {
      type: 'string',
      nullable: false,
      transform: ['trim'],
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'html',
    'css',
  ],
  ...SCHEMA,
}
