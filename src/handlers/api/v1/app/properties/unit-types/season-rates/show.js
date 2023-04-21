const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const { selectOneBy } = require('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
const {
  selectBy: selectUnitTypeRateSeasonPrices,
} = require('../../../../../../../models/v1/unit-type-rate-season-prices/repositories')
const {
  PERMITED_ITEM_PARAMS, serialize,
} = require('../../../../../../../models/v1/unit-type-rate-seasons/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const seasonRate = await selectOneBy({ id, accountId })

  if (!seasonRate) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const pricesNightly = await selectUnitTypeRateSeasonPrices({
    accountId,
    propertyUnitTypeRateSeasonId: seasonRate.id,
  })

  return res.json({
    data: serialize(PERMITED_ITEM_PARAMS, seasonRate, {
      pricesNightly,
    }),
  })
})
