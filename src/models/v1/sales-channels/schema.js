const SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
    commission: {
      type: 'number',
      nullable: true,
      minimum: 0,
      maximum: 100,
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'name',
    'commission',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
