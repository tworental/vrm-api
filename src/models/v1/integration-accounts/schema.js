const SCHEMA = {
  type: 'object',
  properties: {
    enabled: {
      type: 'integer',
      enum: [0, 1],
    },
    settings: {
      type: 'object',
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'enabled',
    'settings',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
