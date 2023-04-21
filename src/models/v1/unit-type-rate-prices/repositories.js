const {
  insert, remove, select, selectOne,
} = require('../../../services/database')
const dao = require('../../../services/dao')

const { TABLE_NAME: UNIT_TYPE_RATE_PRICES_TABLE } = require('./constants')
const { TABLE_NAME: UNIT_TYPE_RATES_TABLE } = require('../unit-type-rates/constants')

const changeAccomodationSize = async ({ accountId, propertyUnitTypeId }, totalGuests, trx) => {
  const unitTypeRate = await selectOne(UNIT_TYPE_RATES_TABLE, { accountId, propertyUnitTypeId }, trx)

  if (!unitTypeRate) {
    throw new Error('Property Unit Type Rate does not exists!')
  }

  const unitTypeRatePrices = await select(UNIT_TYPE_RATE_PRICES_TABLE, {
    accountId, propertyUnitTypeRateId: unitTypeRate.id,
  }, trx)

  if (totalGuests < unitTypeRatePrices.length) {
    const ratePricesToRemove = unitTypeRatePrices.splice(totalGuests, unitTypeRatePrices.length)

    return Promise.all(ratePricesToRemove.map(
      (item) => remove(UNIT_TYPE_RATE_PRICES_TABLE, { id: item.id }, trx),
    ))
  }

  if (totalGuests > unitTypeRatePrices.length) {
    return Promise.all(
      Array.from({ length: totalGuests - unitTypeRatePrices.length }, (_, i) => insert(UNIT_TYPE_RATE_PRICES_TABLE, {
        accountId,
        propertyUnitTypeRateId: unitTypeRate.id,
        occupancy: (i + 1) + unitTypeRatePrices.length,
        enabled: 1,
      }, trx)),
    )
  }
  return Promise.resolve()
}

const withUnitTypeRates = (queryBuilder) => (
  queryBuilder
    .join(
      UNIT_TYPE_RATES_TABLE,
      `${UNIT_TYPE_RATES_TABLE}.id`,
      `${UNIT_TYPE_RATE_PRICES_TABLE}.property_unit_type_rate_id`,
    )
    .clearSelect()
    .select([
      `${UNIT_TYPE_RATE_PRICES_TABLE}.*`, 'property_unit_type_rates.*',
    ])
)

module.exports = dao({
  tableName: UNIT_TYPE_RATE_PRICES_TABLE,
  methods: {
    changeAccomodationSize,
    withUnitTypeRates,
  },
})
