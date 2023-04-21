const {
  select,
  selectOne,
  update,
  createTransaction,
} = require('../../../services/database')
const { removeUndefinedKeys } = require('../../../services/utility')
const dao = require('../../../services/dao')

const { completenessDetails: unitTypeCompletenessDetails } = require('../unit-types/repositories')
const { completenessDetails: unitCompletenessDetails } = require('../units/repositories')

const { TABLE_NAME: PROPERTIES_TABLE_NAME } = require('./constants')
const { TABLE_NAME: IMAGES_TABLE_NAME } = require('../property-images/constants')
const { TABLE_NAME: UNIT_TYPES_TABLE_NAME } = require('../unit-types/constants')
const { TABLE_NAME: UNIT_TYPE_RATES_TABLE_NAME } = require('../unit-type-rates/constants')
const { TABLE_NAME: UNIT_TYPE_RATE_PRICES_TABLE_NAME } = require('../unit-type-rate-prices/constants')
const { TABLE_NAME: UNITS_TABLE_NAME } = require('../units/constants')

const completenessDetails = async (property, trx) => {
  let overview = false
  let location = false
  let unitType = false
  let photos = false
  let rates

  if (property) {
    const {
      id,
      name,
      multipleUnitTypes,
      dictPropertyTypeId,
      checkinTime,
      checkoutTime,
      coordinates,
      address,
    } = property

    overview = Boolean(name && dictPropertyTypeId && checkinTime, checkoutTime)

    location = (coordinates && address)
      ? Boolean(coordinates.lat && coordinates.lng && address.cityPlaceId)
      : false

    photos = await selectOne(IMAGES_TABLE_NAME, { propertyId: id }, trx)
      .whereNull('propertyUnitTypeId')
      .whereNull('propertyUnitTypeUnitId')
      .then((results) => !!results)

    unitType = await selectOne(UNIT_TYPES_TABLE_NAME, { propertyId: id, isCompleted: 1 }, trx)
      .then((results) => !!results)

    if (!multipleUnitTypes) {
      rates = await select(UNIT_TYPE_RATE_PRICES_TABLE_NAME, { enabled: 1 }, trx)
        .select('priceWeekdayEnabled')
        .join(UNIT_TYPE_RATES_TABLE_NAME, (builder) => {
          builder.on(`${UNIT_TYPE_RATES_TABLE_NAME}.id`, `${UNIT_TYPE_RATE_PRICES_TABLE_NAME}.property_unit_type_rate_id`)
            .on('property_id', id)
        }).then((results) => !results.find((item) => {
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
    }
  }

  return removeUndefinedKeys({
    overview, location, photos, unitType, rates,
  })
}

const updateCompletenessStatus = async (id) => {
  const property = await selectOne(PROPERTIES_TABLE_NAME, { id })

  if (!property) throw new Error('Property does not exists')

  const unitTypes = await select(UNIT_TYPES_TABLE_NAME, { propertyId: id })
  const units = await select(UNITS_TABLE_NAME, { propertyId: id })

  await createTransaction(async (trx) => {
    await Promise.all(
      units.map(async (unit) => (
        unitCompletenessDetails(unit, property.multipleUnitTypes, trx)
          .then((results) => Object.values(results).indexOf(false) === -1)
          .then((isCompleted) => update(UNITS_TABLE_NAME, { isCompleted }, { id: unit.id }, trx))
      )),
    )

    await Promise.all(
      unitTypes.map(async (unitType) => (
        unitTypeCompletenessDetails(unitType, property.multipleUnitTypes, trx)
          .then((results) => Object.values(results).indexOf(false) === -1)
          .then((isCompleted) => update(UNIT_TYPES_TABLE_NAME, { isCompleted }, { id: unitType.id }, trx))
      )),
    )

    const isPropertyCompleted = await completenessDetails(property, trx)
      .then((results) => Object.values(results).every((value) => !!value))

    await update(PROPERTIES_TABLE_NAME, { isCompleted: isPropertyCompleted }, { id: property.id }, trx)
  })
}

const isPropertyCompleted = (property, trx) => completenessDetails(property, trx)
  .then((results) => Object.values(results).every((value) => !!value))

module.exports = dao({
  tableName: PROPERTIES_TABLE_NAME,
  jsonFields: ['languages', 'address', 'coordinates', 'distances'],
  softDelete: true,
  methods: {
    isPropertyCompleted,
    completenessDetails,
    updateCompletenessStatus,
  },
})
