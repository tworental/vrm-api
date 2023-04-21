const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy } = require('../../../../../models/v1/rate-seasons/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/rate-seasons/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const results = await selectOneBy({ id, accountId })

  if (!results) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await serialize(PERMITED_ITEM_PARAMS, results)

  return res.json({ data })
})
