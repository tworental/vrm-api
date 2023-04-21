const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy } = require('../../../../../models/v1/taxes/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/taxes/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const data = await selectOneBy({ id, accountId })
    .then((results) => serialize(PERMITED_ITEM_PARAMS, results))

  if (!data) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  return res.json({ data })
})
