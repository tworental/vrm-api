const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/rate-seasons/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/rate-seasons/serializers')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const results = await selectBy({ accountId })

  return res.json({
    data: serialize(PERMITED_COLLECTION_PARAMS, results),
  })
})
