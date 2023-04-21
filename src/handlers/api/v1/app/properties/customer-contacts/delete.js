const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../../models/v1/property-customer-contacts/repositories')

module.exports = handler(async ({ params: { id, propertyId }, user: { accountId } }, res) => {
  if (!await selectOneBy({ id, accountId, propertyId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deleteBy({ id, accountId, propertyId })

  cache.del(`accounts.${accountId}.properties.*`)

  return res.sendStatus(204)
})
