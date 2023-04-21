const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/permissions/repositories')

module.exports = handler(async ({ user: { accountId }, query: { userId = null } }, res) => {
  const data = await cache.wrap(`accounts.${accountId}.users${userId ? `.${userId}` : ''}.premissions`, () => (
    selectBy({ accountId, userId })
  ))

  return res.json({ data })
})
