const SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      nullable: false,
      transform: ['trim'],
    },
    description: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
    active: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'name',
  ],
  properties: {
    name: SCHEMA.properties.name,
  },
}

exports.UPDATE_SCHEMA = SCHEMA
