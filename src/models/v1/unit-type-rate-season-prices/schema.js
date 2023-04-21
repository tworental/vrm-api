const { SCHEMA: UNIT_TYPE_RATE_PRICES_SCHEMA } = require('../unit-type-rate-prices/schema')

exports.SCHEMA = {
  ...UNIT_TYPE_RATE_PRICES_SCHEMA,
  properties: {
    ...UNIT_TYPE_RATE_PRICES_SCHEMA.properties,
    priceDefault: {
      type: 'integer',
      enum: [0, 1],
    },
  },
}
