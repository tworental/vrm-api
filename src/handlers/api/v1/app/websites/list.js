const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/websites/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/websites/serializers')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const data = await selectBy({ accountId })
    .then((results) => serialize(PERMITED_COLLECTION_PARAMS, results, { currentVersion: 1 }))

  return res.json({ data })
})
