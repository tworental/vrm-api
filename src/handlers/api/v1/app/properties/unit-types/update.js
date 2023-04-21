const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectPropertyBy,
  updateCompletenessStatus,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectUnitTypeBy,
  updateBy: updateUnitTypesBy,
} = require('../../../../../../models/v1/unit-types/repositories')
const {
  updateBy: updateUnitsBy,
} = require('../../../../../../models/v1/units/repositories')
const {
  changeAccomodationSize: changeRateAccomodationSize,
} = require('../../../../../../models/v1/unit-type-rate-prices/repositories')
const {
  changeAccomodationSize: changeRateSeasonAccomodationSize,
} = require('../../../../../../models/v1/unit-type-rate-season-prices/repositories')
const {
  upsertBy: upsertArrangementsBy,
} = require('../../../../../../models/v1/unit-type-arrangements/repositories')
const {
  upsertBy: upsertAmenitiesBy,
} = require('../../../../../../models/v1/unit-type-amenities/repositories')
const {
  selectOneBy: selectGuestTypeBy,
} = require('../../../../../../models/v1/dict-guest-types/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/unit-types/schema')

module.exports = handler(async ({ body, user: { accountId }, params: { propertyId, id } }, res) => {
  const property = await selectPropertyBy({ id: propertyId, accountId })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const unitType = await selectUnitTypeBy({ id, propertyId })

  if (!unitType) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const { amenities, arrangements, ...payload } = await validate(body, { schema: UPDATE_SCHEMA })

  if (payload.dictGuestTypeId) {
    if (!await selectGuestTypeBy({ id: payload.dictGuestTypeId })) {
      delete payload.dictGuestTypeId
    }
  }

  await createTransaction(async (trx) => {
    await upsertAmenitiesBy(id, amenities, trx)
    await upsertArrangementsBy(id, arrangements, trx)

    if (payload.area) {
      await updateUnitsBy({ propertyId, propertyUnitTypeId: unitType.id, area: null }, {
        area: payload.area || unitType.area,
        areaUnit: payload.areaUnit || unitType.areaUnit,
      }, trx)
    }

    if (payload.isActive) {
      await updateUnitsBy({ propertyId, propertyUnitTypeId: unitType.id }, {
        isActive: payload.isActive,
      }, trx)
    }

    if (payload.totalGuests) {
      await changeRateAccomodationSize({
        accountId, propertyUnitTypeId: unitType.id,
      }, payload.totalGuests, trx)

      await changeRateSeasonAccomodationSize({
        accountId, propertyUnitTypeId: unitType.id,
      }, payload.totalGuests, trx)
    }

    await updateUnitTypesBy({ id }, payload, trx)
  })

  await updateCompletenessStatus(propertyId)

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
