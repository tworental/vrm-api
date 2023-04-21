const { select, selectOne } = require('../../../services/database')
const { removeUndefinedKeys } = require('../../../services/utility')
const dao = require('../../../services/dao')

const { TABLE_NAME: UNIT_TYPES_TABLE_NAME } = require('./constants')
const { TABLE_NAME: IMAGES_TABLE_NAME } = require('../property-images/constants')
const { TABLE_NAME: UNIT_TYPE_RATES_TABLE_NAME } = require('../unit-type-rates/constants')
const { TABLE_NAME: UNIT_TYPE_RATE_PRICES_TABLE_NAME } = require('../unit-type-rate-prices/constants')
const { TABLE_NAME: UNITS_TABLE_NAME } = require('../units/constants')

const completenessDetails = async (unitType, multipleUnitTypes, trx) => {
  let overview = false
  let rates = false
  let units = false
  let photos

  if (unitType) {
    const {
      id,
      propertyId,
      name,
      area,
      totalGuests,
    } = unitType

    overview = Boolean(name && area && totalGuests)

    if (Number(multipleUnitTypes)) {
      photos = await selectOne(IMAGES_TABLE_NAME, { propertyId, propertyUnitTypeId: id }, trx)
        .whereNull('propertyUnitTypeUnitId')
        .then((results) => !!results)
    }

    rates = await select(UNIT_TYPE_RATE_PRICES_TABLE_NAME, { propertyUnitTypeId: id, enabled: 1 }, trx)
      .select('priceWeekdayEnabled')
      .join(
        UNIT_TYPE_RATES_TABLE_NAME,
        `${UNIT_TYPE_RATES_TABLE_NAME}.id`,
        `${UNIT_TYPE_RATE_PRICES_TABLE_NAME}.property_unit_type_rate_id`,
      )
      .then((results) => !results.find((item) => {
        if (item.priceWeekdayEnabled === 1) {
          return (
            item.priceWeekdayMo === null
            || item.priceWeekdayTu === null
            || item.priceWeekdayWe === null
            || item.priceWeekdayTh === null
            || item.priceWeekdayFr === null
            || item.priceWeekdaySa === null
            || item.priceWeekdaySu === null
          )
        }
        return item.priceNightly === null
      }))

    units = await selectOne(UNITS_TABLE_NAME, { propertyId, propertyUnitTypeId: id, isCompleted: 1 }, trx)
      .whereNotNull('area')
      .then((results) => !!results)
  }

  return removeUndefinedKeys({
    overview, photos, rates, units,
  })
}

module.exports = dao({
  tableName: UNIT_TYPES_TABLE_NAME,
  softDelete: true,
  methods: {
    completenessDetails,
  },
})
