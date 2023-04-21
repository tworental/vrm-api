const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy } = require('../../../../../models/v1/companies/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/companies/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const company = await selectOneBy({ accountId, id })

  if (!company) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await serialize(PERMITED_ITEM_PARAMS, company)

  return res.json({ data })
})
