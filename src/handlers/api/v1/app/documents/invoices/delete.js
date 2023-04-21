const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../../models/v1/documents/invoices/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const invoice = await selectOneBy({ accountId, id })

  if (!invoice) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deleteBy({ id })

  cache.del([
    `accounts.${accountId}.invoices.pagination.*`,
  ])

  return res.sendStatus(204)
})
