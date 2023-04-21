const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')

module.exports = handler(({ user: { id, accountId } }, res) => {
  cache.del(`accounts.${accountId}.users.${id}`)

  return res.sendStatus(200)
})
