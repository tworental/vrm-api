const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const {
  selectOneBy: selectPropertyBy,
  create: createProperty,
} = require('../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectUnitType,
  create: createUnitType,
} = require('../../../../../models/v1/unit-types/repositories')
const { create: createUnitTypeRate } = require('../../../../../models/v1/unit-type-rates/repositories')
const { create: createUnitTypeRatePrice } = require('../../../../../models/v1/unit-type-rate-prices/repositories')
const { create: createUnit } = require('../../../../../models/v1/units/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/properties/serializers')
const { DEFAULT_RATE_NAME } = require('../../../../../models/v1/unit-type-rates/constants')
const {
  DEFAULT_NAME: DEFAULT_UNIT_TYPE_NAME,
} = require('../../../../../models/v1/unit-types/constants')
const {
  DEFAULT_COLOR: DEFAULT_UNIT_COLOR,
  DEFAULT_NAME: DEFAULT_UNIT_NAME,
} = require('../../../../../models/v1/units/constants')
const { CREATE_SCHEMA } = require('../../../../../models/v1/properties/schema')

module.exports = handler(async ({ body, account: { id: accountId, settings } }, res) => {
  const { name, multipleUnitTypes } = await validate(body, { schema: CREATE_SCHEMA })

  /**
   * Everytime when we create a new property then we must also
   * create new unit type, default rate + price and unit.
   */
  const id = await createTransaction(async (trx) => {
    const propertyId = await createProperty({
      accountId,
      name,
      multipleUnitTypes,
      languages: [
        settings.language,
      ],
    }, trx)

    const propertyUnitTypeId = await createUnitType({
      propertyId,
      name: DEFAULT_UNIT_TYPE_NAME,
    }, trx)

    const propertyUnitTypeRateId = await createUnitTypeRate({
      accountId,
      propertyId,
      propertyUnitTypeId,
      name: DEFAULT_RATE_NAME,
    }, trx)

    const { totalGuests } = await selectUnitType({ id: propertyUnitTypeId, propertyId }, trx)

    await Promise.all(
      Array.from({ length: totalGuests }, (_, i) => createUnitTypeRatePrice({
        accountId,
        propertyUnitTypeRateId,
        occupancy: (i + 1),
        enabled: 1,
      }, trx)),
    )

    await createUnit({
      propertyId,
      propertyUnitTypeId,
      name: DEFAULT_UNIT_NAME,
      color: DEFAULT_UNIT_COLOR,
    }, trx)

    return propertyId
  })

  const data = await selectPropertyBy({ id })

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.json({
    data: serialize(PERMITED_ITEM_PARAMS, data),
  })
})
