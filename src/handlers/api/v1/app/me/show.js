const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/permissions/repositories')
const { serialize } = require('../../../../../models/v1/users/serializers')
const { ABILITIES } = require('../../../../../models/v1/permissions/constants')

module.exports = handler(async ({ user }, res) => {
  const permissions = await cache.wrap(`accounts.${user.accountId}.users.${user.id}.premissions`, () => (
    selectBy({ accountId: user.accountId, userId: user.id })
      .then((results) => results.reduce((acc, curr) => ({
        ...acc,
        [curr.name]: user.isAccountOwner
          ? Object.values(ABILITIES)
          : (curr.abilities || []),
      }), {}))
  ))

  const data = await serialize(user, { permissions })

  return res.json({ data })
})
