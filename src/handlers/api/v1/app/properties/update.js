const cache = require('../../../../../services/cacheManager')
const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const { selectOneBy: selectPropertyTypeBy } = require('../../../../../models/v1/dict-property-types/repositories')
const {
  selectOneBy: selectPropertyBy,
  updateBy: updatePropertiesBy,
  updateCompletenessStatus,
} = require('../../../../../models/v1/properties/repositories')
const {
  upsertBy: upsertUnitTypesArrangementsBy,
} = require('../../../../../models/v1/unit-type-arrangements/repositories')
const {
  selectOneBy: selectUnitTypeBy,
  updateBy: updateUnitTypesBy,
} = require('../../../../../models/v1/unit-types/repositories')
const {
  changeAccomodationSize: changeRateAccomodationSize,
} = require('../../../../../models/v1/unit-type-rate-prices/repositories')
const {
  changeAccomodationSize: changeRateSeasonAccomodationSize,
} = require('../../../../../models/v1/unit-type-rate-season-prices/repositories')
const { updateBy: updateUnitsBy } = require('../../../../../models/v1/units/repositories')
const { upsertBy: upsertPropertyAmenitiesBy } = require('../../../../../models/v1/property-amenities/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/properties/schema')

module.exports = handler(async ({ body, params: { id }, user: { accountId } }, res) => {
  const property = await selectPropertyBy({ accountId, id })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const {
    amenities,
    arrangements,
    area,
    areaUnit,
    totalGuests,
    maxAdults,
    maxChildren,
    maxInfants,
    status,
    isActive,
    floor,
    ...payload
  } = await validate(body, { schema: UPDATE_SCHEMA })

  if (payload.dictPropertyTypeId) {
    if (!await selectPropertyTypeBy({ id: payload.dictPropertyTypeId })) {
      delete payload.dictPropertyTypeId
    }
  }

  await createTransaction(async (trx) => {
    await upsertPropertyAmenitiesBy(id, amenities, trx)

    /**
     * We should update unit & unitType belongs to the property only
     * when property has disabled "multipleUnitTypes" flag.
     */
    if (!Number(property.multipleUnitTypes)) {
      const unitType = await selectUnitTypeBy({ propertyId: id }, trx)

      /**
       * We should update unitTypes when name, area or totalGuests was passed
       */
      if (payload.name || area || areaUnit || totalGuests) {
        await updateUnitTypesBy({ propertyId: id }, {
          name: payload.name, area, areaUnit, totalGuests, maxAdults: maxAdults || totalGuests, maxChildren, maxInfants,
        }, trx)

        if (totalGuests) {
          await changeRateAccomodationSize({
            accountId, propertyUnitTypeId: unitType.id,
          }, totalGuests, trx)

          await changeRateSeasonAccomodationSize({
            accountId, propertyUnitTypeId: unitType.id,
          }, totalGuests, trx)
        }
      }

      /**
       * We should unitTypes arrangements the "arrangements" argument was passed
       */
      if (arrangements) {
        await upsertUnitTypesArrangementsBy(unitType.id, arrangements, trx)
      }

      /**
       * We should update units when name, area, isActive, floor or status was passed
       */
      if (payload.name || area || areaUnit || isActive || floor || status) {
        await updateUnitsBy({ propertyId: id }, {
          name: payload.name, area, areaUnit, isActive, floor, status,
        }, trx)
      }
    }

    await updatePropertiesBy({ id }, payload, trx)
  })

  await updateCompletenessStatus(id)

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
