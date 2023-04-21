const cache = require('../../../../../../services/cacheManager')
const { handler } = require('../../../../../../services/http')

const {
  selectBy,
} = require('../../../../../../models/v1/billing/subscriptions/repositories')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const subscrptions = await cache.wrap(`accounts.${accountId}.subscriptions`, cache.TTL.H12, () => (
    selectBy({ accountId })
  ))

  return res.json({ data: subscrptions })
})
