const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/dict-amenities/repositories')

module.exports = handler(async ({ query: { type = 'general' } }, res) => {
  const data = await cache.wrap(`dictionaries.amenities.${type}`, cache.TTL.H2, () => (
    selectBy()
      .where((queryBuilder) => {
        if (type) {
          queryBuilder
            .where('type', type)
            .orWhereNull('type')
        }
      })
  ))

  return res.json({ data })
})
