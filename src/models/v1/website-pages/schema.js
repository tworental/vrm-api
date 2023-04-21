const SCHEMA = {
  type: 'object',
  properties: {
    websiteId: {
      type: 'integer',
      nullable: false,
      minimum: 1,
    },
    name: {
      type: 'string',
      nullable: false,
      transform: ['trim'],
    },
    tags: {
      type: 'array',
      items: {
        type: 'object',
        nullable: true,
      },
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'name',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
