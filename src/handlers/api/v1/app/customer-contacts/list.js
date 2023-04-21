const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/customer-contacts/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/customer-contacts/serializers')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const data = await selectBy({ accountId })
    .orderBy('is_default', 'desc')
    .then((results) => serialize(PERMITED_COLLECTION_PARAMS, results))

  return res.json({ data })
})
