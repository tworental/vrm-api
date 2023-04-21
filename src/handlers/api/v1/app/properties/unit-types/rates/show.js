const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const {
  selectOneBy: selectUnitTypeRate,
} = require('../../../../../../../models/v1/unit-type-rates/repositories')
const {
  selectBy: selectUnitTypeRatePrices,
} = require('../../../../../../../models/v1/unit-type-rate-prices/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../../models/v1/unit-type-rates/serializers')

module.exports = handler(async ({ user: { accountId }, params: { propertyUnitTypeId } }, res) => {
  const unitTypeRate = await selectUnitTypeRate({ propertyUnitTypeId, accountId })

  if (!unitTypeRate) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const pricesNightly = await selectUnitTypeRatePrices({
    accountId,
    propertyUnitTypeRateId: unitTypeRate.id,
  })

  return res.json({
    data: serialize(PERMITED_ITEM_PARAMS, unitTypeRate, {
      pricesNightly,
    }),
  })
})
