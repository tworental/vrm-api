const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/sales-channels/repositories')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const data = await selectBy({ accountId })

  return res.json({ data })
})
