const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy } = require('../../../../../../models/v1/documents/invoices/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/documents/invoices/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const invoice = await selectOneBy({ accountId, id })

  if (!invoice) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  return res.json({ data: serialize(PERMITED_ITEM_PARAMS, invoice) })
})
