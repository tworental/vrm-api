const cache = require('../../../../../../../services/cacheManager')
const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const { validate } = require('../../../../../../../services/validate')
const { createTransaction } = require('../../../../../../../services/database')
const {
  updateCompletenessStatus,
} = require('../../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectUnitType,
} = require('../../../../../../../models/v1/unit-types/repositories')
const {
  selectOneBy: selectUnitTypeRate,
  updateBy: updateUnitTypeRate,
} = require('../../../../../../../models/v1/unit-type-rates/repositories')
const {
  updateBy: updateUnitTypeRatePrice,
  selectBy: selectUnitTypeRatePrices,
} = require('../../../../../../../models/v1/unit-type-rate-prices/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../../models/v1/unit-type-rates/schema')

module.exports = handler(async ({ body, user: { accountId }, params: { propertyId, propertyUnitTypeId } }, res) => {
  const unitType = await selectUnitType({ id: propertyUnitTypeId, propertyId })

  /**
   * We must check whether UNIT TYPE exists or not.
   */
  if (!unitType) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const unitTypeRate = await selectUnitTypeRate({ propertyId, propertyUnitTypeId, accountId })

  /**
   * And UNIT TYPE RATE also must exists in the table.
   */
  if (!unitTypeRate) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const { pricesNightly = [], ...payload } = await validate(body, { schema: UPDATE_SCHEMA })

  const unitTypeRatePrices = await selectUnitTypeRatePrices({
    accountId, propertyUnitTypeRateId: unitTypeRate.id,
  })

  const accomodations = pricesNightly.filter(
    (item) => unitTypeRatePrices.map((price) => price.id).includes(item.id),
  )

  await createTransaction(async (trx) => {
    await updateUnitTypeRate({ id: unitTypeRate.id }, {
      ...payload,
      accountId,
      propertyUnitTypeId,
    }, trx)

    if (Array.isArray(accomodations) && accomodations.length) {
      await Promise.all(accomodations.map(
        ({ id, ...item }, index) => updateUnitTypeRatePrice(
          { id, accountId }, { ...item, occupancy: (index + 1) }, trx,
        ),
      ))
    }
  })

  await updateCompletenessStatus(propertyId)

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
