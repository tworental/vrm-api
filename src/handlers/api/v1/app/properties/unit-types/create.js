const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectUnitType,
  create: createUnitType,
} = require('../../../../../../models/v1/unit-types/repositories')
const { create: createUnitTypeRate } = require('../../../../../../models/v1/unit-type-rates/repositories')
const { create: createUnitTypeRatePrice } = require('../../../../../../models/v1/unit-type-rate-prices/repositories')
const { create: createUnit } = require('../../../../../../models/v1/units/repositories')
const { DEFAULT_RATE_NAME } = require('../../../../../../models/v1/unit-type-rates/constants')
const { DEFAULT_COLOR } = require('../../../../../../models/v1/units/constants')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/unit-types/schema')

module.exports = handler(async ({ body, params: { propertyId }, account: { id: accountId } }, res) => {
  if (!await selectPropertyBy({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const { unitsNo, ...payload } = await validate(body, { schema: CREATE_SCHEMA })

  /**
   * Everytime when we create a new unit type then we must also
   * create a default unit type rate and unit.
   */
  const id = await createTransaction(async (trx) => {
    const propertyUnitTypeId = await createUnitType({
      propertyId, ...payload,
    }, trx)

    const propertyUnitTypeRateId = await createUnitTypeRate({
      accountId,
      propertyId,
      propertyUnitTypeId,
      name: DEFAULT_RATE_NAME,
    }, trx)

    const { totalGuests, area, areaUnit } = await selectUnitType({ id: propertyUnitTypeId, propertyId }, trx)

    await Promise.all(
      Array.from({ length: totalGuests }, (_, i) => createUnitTypeRatePrice({
        accountId,
        propertyUnitTypeRateId,
        occupancy: (i + 1),
        enabled: 1,
      }, trx)),
    )

    await Promise.all(
      Array.from({ length: unitsNo }, (_, i) => createUnit({
        propertyId,
        propertyUnitTypeId,
        areaUnit,
        area,
        name: `Unit ${i + 1}`,
        color: DEFAULT_COLOR,
      }, trx)),
    )

    return propertyUnitTypeId
  })

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.json({ data: { id } })
})
