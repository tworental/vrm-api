const SCHEMA = {
  type: 'object',
  required: ['enabled'],
  properties: {
    enabled: {
      type: 'integer',
      enum: [0, 1],
    },
  },
}

exports.UPDATE_SCHEMA = SCHEMA
