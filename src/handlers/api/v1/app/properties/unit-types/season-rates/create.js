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
  selectOneBy: selectUnitTypeRate,
} = require('../../../../../../../models/v1/unit-type-rates/repositories')
const {
  create: createUnitTypeRateSeasonPrice,
} = require('../../../../../../../models/v1/unit-type-rate-season-prices/repositories')
const {
  create: createUnitTypeRateSeason,
} = require('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
const {
  rateAttrs: rateSeasonAttrs,
  ratePriceAttrs: rateSeasonPriceAttrs,
  selectOneBy: selectRateSeason,
} = require('../../../../../../../models/v1/rate-seasons/repositories')
const { CREATE_SCHEMA } = require('../../../../../../../models/v1/unit-type-rate-seasons/schema')

module.exports = handler(async ({ body, user: { accountId }, params: { propertyId, propertyUnitTypeId } }, res) => {
  const unitType = await selectUnitType({ id: propertyUnitTypeId, propertyId })

  /**
   * We must check whether UNIT TYPE exists or not.
   */
  if (!unitType) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const {
    rateSeasonId, propertyUnitTypeRateId, ...data
  } = await validate(body, { schema: CREATE_SCHEMA })

  const unitTypeRate = await selectUnitTypeRate({ id: propertyUnitTypeRateId, accountId })

  if (!unitTypeRate) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: {
        propertyUnitTypeRateId: ['notExists'],
      },
    })
  }

  let ratePayload = data
  let pricePayload = { accountId, enabled: 1 }

  if (rateSeasonId) {
    const seasonRate = await selectRateSeason({ accountId, id: rateSeasonId })

    if (seasonRate) {
      if (unitTypeRate.currency !== seasonRate.currency) {
        throw createError(400, MESSAGES.VALIDATION_FAILED, {
          code: CODES.VALIDATION_FAILED,
          errors: {
            rateSeasonId: [
              {
                name: 'notMatch',
                message: 'should match',
                params: {
                  field: 'currency',
                },
              },
            ],
          },
        })
      }

      pricePayload = {
        ...pricePayload,
        ...rateSeasonPriceAttrs(seasonRate),
      }

      ratePayload = {
        ...rateSeasonAttrs(seasonRate),
        ...ratePayload,
      }
    }
  }

  const id = await createTransaction(async (trx) => {
    const propertyUnitTypeRateSeasonId = await createUnitTypeRateSeason({
      ...ratePayload,
      accountId,
      propertyUnitTypeId,
      propertyUnitTypeRateId,
    }, trx)

    await Promise.all(
      Array.from({ length: unitType.totalGuests }, (_, i) => createUnitTypeRateSeasonPrice({
        ...pricePayload,
        propertyUnitTypeRateSeasonId,
        occupancy: (i + 1),
      }, trx)),
    )

    return propertyUnitTypeRateSeasonId
  })

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.json({ data: { id } })
})
