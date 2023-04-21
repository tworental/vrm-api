const SCHEMA = {
  type: 'object',
  properties: {
    folderId: {
      type: 'string',
    },
    name: {
      type: 'string',
      maxLength: 191,
      transform: ['trim'],
    },
    starred: {
      type: 'number',
      enum: [0, 1],
    },
    hidden: {
      type: 'number',
      enum: [0, 1],
    },
    pinned: {
      type: 'number',
      enum: [0, 1],
    },
    labels: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            transform: ['trim'],
          },
          color: {
            type: 'string',
            minLength: 3,
            maxLength: 10,
          },
        },
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

exports.UPDATE_SCHEMA = {
  type: SCHEMA.type,
  properties: {
    ...SCHEMA.properties,
    deletedAt: {
      type: 'string',
    },
  },
}
