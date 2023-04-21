const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/dict-arrangements/repositories')

module.exports = handler(async ({ query: { type } }, res) => {
  const data = await cache.wrap(`dictionaries.arrangements.${type}`, cache.TTL.H2, () => (
    selectBy({ type })
  ))

  return res.json({ data })
})
