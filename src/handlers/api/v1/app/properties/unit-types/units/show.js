const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../../models/v1/properties/repositories')
const { selectOneBy: selectOneUnitBy } = require('../../../../../../../models/v1/units/repositories')
const { selectBy: selectAmenitiesBy } = require('../../../../../../../models/v1/unit-amenities/repositories')
const { selectBy: selectArrangementsBy } = require('../../../../../../../models/v1/unit-arrangements/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../../models/v1/units/serializers')

module.exports = handler(async ({ user: { accountId }, params: { propertyId, propertyUnitTypeId, id } }, res) => {
  if (!await selectPropertyBy({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const unit = await selectOneUnitBy({ id, propertyId, propertyUnitTypeId })

  if (!unit) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  /**
   * We are adding an extra data (unit arrangements) to units response.
   */
  const arrangements = await selectArrangementsBy({ propertyUnitTypeUnitId: id })
    .then((results) => results.map(({
      dictArrangementId, count, privacy, type,
    }) => ({
      dictArrangementId, count, privacy, type,
    })))

  /**
   * We are adding an extra data (unit ammenities) to units response.
   */
  const amenities = await selectAmenitiesBy({ propertyUnitTypeUnitId: id })
    .then((results) => results.map(({ dictAmenityId, count }) => ({ dictAmenityId, count })))

  return res.json({
    data: serialize(PERMITED_ITEM_PARAMS, unit, { arrangements, amenities }),
  })
})
