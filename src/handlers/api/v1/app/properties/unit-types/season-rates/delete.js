const cache = require('../../../../../../../services/cacheManager')
const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../../../models/v1/unit-type-rate-seasons/repositories')

module.exports = handler(async ({ user: { accountId }, params: { propertyUnitTypeId, id } }, res) => {
  if (!await selectOneBy({ id, accountId, propertyUnitTypeId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deleteBy({ id, accountId, propertyUnitTypeId })

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
