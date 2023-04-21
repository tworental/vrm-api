exports.SCHEMA = {
  type: 'object',
  required: [
    'prices',
  ],
  properties: {
    prices: {
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            maxLength: 100,
          },
          quantity: {
            type: 'number',
            default: 1,
            minimum: 0,
            maximum: 2000,
          },
        },
      },
    },
  },
}
