const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/companies/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/companies/serializers')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const results = await selectBy({ accountId })

  const data = await serialize(PERMITED_COLLECTION_PARAMS, results)

  return res.json({ data })
})
