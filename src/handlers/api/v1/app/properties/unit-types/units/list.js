const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../../models/v1/properties/repositories')
const { selectOneBy: selectOneUnitTypeBy } = require('../../../../../../../models/v1/unit-types/repositories')
const { selectBy: selectUnitsBy } = require('../../../../../../../models/v1/units/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../../models/v1/units/serializers')

module.exports = handler(async ({ user: { accountId }, params: { propertyId, propertyUnitTypeId } }, res) => {
  if (!await selectPropertyBy({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await selectOneUnitTypeBy({ id: propertyUnitTypeId, propertyId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await selectUnitsBy({ propertyId, propertyUnitTypeId })
    .then((results) => serialize(PERMITED_COLLECTION_PARAMS, results))

  return res.json({ data })
})
