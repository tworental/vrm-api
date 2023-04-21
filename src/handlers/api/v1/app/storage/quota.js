const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { sum } = require('../../../../../models/v1/storage/files/repositories')
const { LIMITS: { APP_STORAGE_QUOTA } } = require('../../../../../models/v1/limits/constants')

module.exports = handler(async ({ limits, user: { accountId } }, res) => {
  const { value: quota } = limits.find(({ name }) => name === APP_STORAGE_QUOTA)
    || { value: 0 }

  const data = await cache.wrap(cache.key(cache.KEY_DEFS.STORAGE_QUOTA, accountId), () => (
    sum('size', { accountId }).then(({ sum: size }) => ({
      size: Number(size),
      quota: Number(quota),
    }))
  ))

  return res.json({ data })
})
