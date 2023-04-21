const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { getLanguagesList } = require('../../../../../services/translate')

module.exports = handler(async (req, res) => {
  const data = await cache.wrap('api.languages', cache.TTL.H12, () => (
    getLanguagesList()
  ))

  return res.json({ data })
})
