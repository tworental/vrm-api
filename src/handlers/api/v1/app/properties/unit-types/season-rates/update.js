const cache = require('../../../../../../../services/cacheManager')
const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const { validate } = require('../../../../../../../services/validate')
const { createTransaction } = require('../../../../../../../services/database')
const {
  selectOneBy: selectUnitType,
} = require('../../../../../../../models/v1/unit-types/repositories')
const {
  selectOneBy: selectUnitTypeRateSeason,
  updateBy: updateUnitTypeRateSeason,
  isCompleted,
} = require('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
const {
  updateBy: updateUnitTypeRateSeasonPrice,
  selectBy: updateUnitTypeRateSeasonPrices,
} = require('../../../../../../../models/v1/unit-type-rate-season-prices/repositories')
const {
  selectOneBy: selectRateSeason,
} = require('../../../../../../../models/v1/rate-seasons/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../../models/v1/unit-type-rate-seasons/schema')

module.exports = handler(async ({
  body, user: { accountId }, params: { id, propertyId, propertyUnitTypeId },
}, res) => {
  const unitType = await selectUnitType({ id: propertyUnitTypeId, propertyId })

  /**
   * We must check whether UNIT TYPE exists or not.
   */
  if (!unitType) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const unitTypeRateSeason = await selectUnitTypeRateSeason({ id, accountId, propertyUnitTypeId })

  /**
   * And UNIT TYPE SEASON RATE also must exists in the table.
   */
  if (!unitTypeRateSeason) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const { pricesNightly = [], rateSeasonId, ...payload } = await validate(body, { schema: UPDATE_SCHEMA })

  let extra = {}

  if (rateSeasonId && await selectRateSeason({ accountId, id: rateSeasonId })) {
    extra = { rateSeasonId }
  }

  const unitTypeRatePrices = await updateUnitTypeRateSeasonPrices({
    accountId, propertyUnitTypeRateSeasonId: unitTypeRateSeason.id,
  })

  const accomodations = pricesNightly.filter(
    (item) => unitTypeRatePrices.map((price) => price.id).includes(item.id),
  )

  await createTransaction(async (trx) => {
    await updateUnitTypeRateSeason({ id: unitTypeRateSeason.id }, {
      ...payload,
      ...extra,
      accountId,
      propertyUnitTypeId,
      isCompleted: isCompleted({
        ...unitTypeRateSeason,
        ...payload,
        accomodations,
      }),
    }, trx)

    if (Array.isArray(accomodations) && accomodations.length) {
      await Promise.all(accomodations.map(
        ({ id: priceId, ...item }) => updateUnitTypeRateSeasonPrice({ id: priceId, accountId }, item, trx),
      ))
    }
  })

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
