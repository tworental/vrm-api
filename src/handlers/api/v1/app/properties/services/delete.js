const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectPropertyService,
  deleteBy: deletePropertyService,
} = require('../../../../../../models/v1/property-services/repositories')

module.exports = handler(async ({ params: { id, propertyId }, account: { id: accountId } }, res) => {
  if (!await selectProperty({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await selectPropertyService({ id, propertyId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deletePropertyService({ id, propertyId })

  return res.sendStatus(204)
})
