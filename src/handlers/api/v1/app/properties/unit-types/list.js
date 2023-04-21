const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const { selectBy: selectUnitTypesBy } = require('../../../../../../models/v1/unit-types/repositories')
const { selectBy: selectUnitsBy } = require('../../../../../../models/v1/units/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/unit-types/serializers')

module.exports = handler(async ({ user: { accountId }, params: { propertyId } }, res) => {
  if (!await selectPropertyBy({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const unitTypes = await selectUnitTypesBy({ propertyId })

  const units = await selectUnitsBy({ propertyId })
    .whereIn('propertyUnitTypeId', unitTypes.map(({ id }) => id))
    .then((items) => items.reduce((acc, curr) => {
      acc[curr.propertyUnitTypeId] = acc[curr.propertyUnitTypeId] || []
      acc[curr.propertyUnitTypeId].push(curr)
      return acc
    }, {}))

  const data = unitTypes.map((unitType) => ({
    ...unitType, unitsNo: (units[unitType.id] || []).length,
  }))

  return res.json({
    data: serialize(PERMITED_COLLECTION_PARAMS, data),
  })
})
