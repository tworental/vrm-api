const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectOneUnitTypeBy,
  completenessDetails: unitTypeCompleteness,
} = require('../../../../../../models/v1/unit-types/repositories')
const { selectBy: selectAmenitiesBy } = require('../../../../../../models/v1/unit-type-amenities/repositories')
const { selectBy: selectArrangementsBy } = require('../../../../../../models/v1/unit-type-arrangements/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/unit-types/serializers')

module.exports = handler(async ({ user: { accountId }, params: { propertyId, id } }, res) => {
  const property = await selectPropertyBy({ id: propertyId, accountId })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const unitType = await selectOneUnitTypeBy({ id, propertyId })

  if (!unitType) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  /**
   * We need add informations about completeness of unit type for each steps for frontend.
   */
  const completeness = await unitTypeCompleteness(unitType, property.multipleUnitTypes)

  /**
   * We are adding an extra data (unit type arrangements) to unitTypes response.
   */
  const arrangements = await selectArrangementsBy({ propertyUnitTypeId: id })
    .then((results) => results.map(({
      dictArrangementId, count, privacy, type,
    }) => ({
      dictArrangementId, count, privacy, type,
    })))

  /**
   * We are adding an extra data (unit type ammenities) to unitTypes response.
   */
  const amenities = await selectAmenitiesBy({ propertyUnitTypeId: id })
    .then((results) => results.map(({ dictAmenityId, count }) => ({ dictAmenityId, count })))

  return res.json({
    data: serialize(PERMITED_ITEM_PARAMS, unitType, { arrangements, amenities, completeness }),
  })
})
