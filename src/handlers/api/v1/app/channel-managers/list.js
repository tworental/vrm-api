const { handler } = require('../../../../../services/http')
const { selectBy, withAccount } = require('../../../../../models/v1/channel-managers/repositories')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const data = await withAccount(accountId)(
    selectBy(),
  )

  return res.json({ data })
})
