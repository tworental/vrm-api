const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const { storageFiles } = require('../../../../../../models/v1/property-images/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/property-images/serializers')

module.exports = handler(async ({
  user: { accountId }, params: { propertyId }, query: { propertyUnitTypeId, propertyUnitTypeUnitId },
}, res) => {
  const property = await selectProperty({ id: propertyId, accountId })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await storageFiles(propertyId, propertyUnitTypeId, propertyUnitTypeUnitId)
    .then((results) => serialize(PERMITED_COLLECTION_PARAMS, results))

  return res.json({ data })
})
