const {
  insert, remove, select,
} = require('../../../services/database')
const dao = require('../../../services/dao')

const { TABLE_NAME: UNIT_TYPE_RATE_SEASON_PRICES_TABLE } = require('./constants')
const { TABLE_NAME: UNIT_TYPE_RATE_SEASONS_TABLE } = require('../unit-type-rate-seasons/constants')
const { TABLE_NAME: UNIT_TYPE_RATES_TABLE } = require('../unit-type-rates/constants')

const { TABLE_NAME } = require('./constants')

const changeAccomodationSize = async ({ accountId, propertyUnitTypeId }, totalGuests, trx) => {
  const unitTypeRateSeasons = await select(UNIT_TYPE_RATE_SEASONS_TABLE, { accountId, propertyUnitTypeId }, trx)

  if (unitTypeRateSeasons.length) {
    const unitTypeRateSeasonPrices = await select(UNIT_TYPE_RATE_SEASON_PRICES_TABLE, { accountId }, trx)
      .whereIn('property_unit_type_rate_season_id', unitTypeRateSeasons.map(({ id }) => id))
      .then((results) => results.reduce((acc, curr) => {
        acc[curr.propertyUnitTypeRateSeasonId] = acc[curr.propertyUnitTypeRateSeasonId] || []
        acc[curr.propertyUnitTypeRateSeasonId].push(curr)
        return acc
      }, {}))

    return Promise.all(
      Object.entries(unitTypeRateSeasonPrices).map(([propertyUnitTypeRateSeasonId, seasonPrices]) => {
        if (totalGuests < seasonPrices.length) {
          const ratePricesToRemove = seasonPrices.splice(totalGuests, seasonPrices.length)

          return Promise.all(ratePricesToRemove.map(
            (item) => remove(UNIT_TYPE_RATE_SEASON_PRICES_TABLE, { id: item.id }, trx),
          ))
        }

        if (totalGuests > seasonPrices.length) {
          return Promise.all(
            Array.from({ length: totalGuests - seasonPrices.length }, (_, i) => (
              insert(UNIT_TYPE_RATE_SEASON_PRICES_TABLE, {
                accountId,
                propertyUnitTypeRateSeasonId,
                occupancy: (i + 1) + seasonPrices.length,
                enabled: 1,
              }, trx)
            )),
          )
        }

        return Promise.resolve()
      }).flat(),
    )
  }
  return Promise.resolve()
}

const withUnitTypeRateSeasons = (queryBuilder) => (
  queryBuilder
    .join(
      UNIT_TYPE_RATE_SEASONS_TABLE,
      `${UNIT_TYPE_RATE_SEASONS_TABLE}.id`,
      `${UNIT_TYPE_RATE_SEASON_PRICES_TABLE}.property_unit_type_rate_season_id`,
    )
    .join(
      UNIT_TYPE_RATES_TABLE,
      `${UNIT_TYPE_RATES_TABLE}.id`,
      `${UNIT_TYPE_RATE_SEASONS_TABLE}.property_unit_type_rate_id`,
    )
    .clearSelect()
    .select([
      `${UNIT_TYPE_RATE_SEASON_PRICES_TABLE}.*`,
      `${UNIT_TYPE_RATE_SEASONS_TABLE}.*`,
    ])
)

module.exports = dao({
  tableName: TABLE_NAME,
  methods: {
    changeAccomodationSize,
    withUnitTypeRateSeasons,
  },
})
