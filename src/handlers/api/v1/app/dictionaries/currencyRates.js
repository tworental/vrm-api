const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/dict-currency-rates/repositories')

module.exports = handler(async (req, res) => {
  const data = await cache.wrap('dictionaries.currencyRates', cache.TTL.H12, () => (
    selectBy()
  ))

  return res.json({ data })
})
