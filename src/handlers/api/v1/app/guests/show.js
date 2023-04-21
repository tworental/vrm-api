const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy } = require('../../../../../models/v1/guests/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/guests/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const guest = await selectOneBy({ accountId, id })

  if (!guest) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await serialize(PERMITED_ITEM_PARAMS, guest)

  return res.json({ data })
})
