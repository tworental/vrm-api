exports.SCHEMA = {
  type: 'object',
  required: [
    'dictAmenityId',
  ],
  properties: {
    dictAmenityId: {
      type: 'integer',
      minimum: 1,
    },
    count: {
      type: 'integer',
      default: 1,
    },
  },
}
