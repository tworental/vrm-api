const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const {
  withProperty,
  withUnitType,
  selectBy: selectUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const { TABLE_NAME: UNITS_TABLE_NAME } = require('../../../../../models/v1/units/constants')
const { TABLE_NAME: UNIT_TYPES_TABLE_NAME } = require('../../../../../models/v1/unit-types/constants')
const { TABLE_NAME: PROPERTIES_TABLE_NAME } = require('../../../../../models/v1/properties/constants')

module.exports = handler(async ({ user: { accountId }, query: { perPage = 10, currentPage = 1 } }, res) => {
  const cacheKey = cache.key(cache.KEY_DEFS.PROPERTIES_CALENDAR, accountId, { perPage, currentPage })

  const { data, pagination } = await cache.wrap(cacheKey, async () => {
    const results = await withProperty(
      withUnitType(
        selectUnitsBy({ accountId }),
      ),
    ).andWhere((builder) => {
      builder
        .where(`${UNIT_TYPES_TABLE_NAME}.is_completed`, '=', 1)
        .where(`${UNITS_TABLE_NAME}.is_completed`, '=', 1)
        .where(`${PROPERTIES_TABLE_NAME}.is_completed`, '=', 1)
        .whereNull(`${PROPERTIES_TABLE_NAME}.deleted_at`)
    }).select([
      `${PROPERTIES_TABLE_NAME}.checkin_time`,
      `${PROPERTIES_TABLE_NAME}.checkout_time`,
    ]).paginate({ perPage, currentPage })

    let response = []

    if (results.data.length) {
      response = results.data.reduce((acc, curr) => {
        const property = acc[curr.propertyId] || {
          id: curr.propertyId,
          name: curr.propertyName,
          checkinTime: curr.checkinTime,
          checkoutTime: curr.checkoutTime,
          multipleUnitTypes: curr.multipleUnitTypes,
          deletedAt: curr.deletedAt,
          unitTypes: {},
        }

        const unitType = property.unitTypes[curr.propertyUnitTypeId] || {
          id: curr.propertyUnitTypeId,
          name: curr.propertyUnitTypeName,
          units: {},
        }

        const unit = unitType.units[curr.id] || {
          id: curr.id,
          name: curr.name,
          color: curr.color,
          status: curr.status,
        }

        return {
          ...acc,
          [curr.propertyId]: {
            ...property,
            unitTypes: {
              ...property.unitTypes,
              [curr.propertyUnitTypeId]: {
                ...unitType,
                units: {
                  ...unitType.units,
                  [curr.id]: unit,
                },
              },
            },
          },
        }
      }, {})
    }

    return {
      data: Object.values(response).map((property) => ({
        ...property,
        unitTypes: Object.values(property.unitTypes).map((unitType) => ({
          ...unitType,
          units: Object.values(unitType.units),
        })),
      })),
      pagination: results.pagination,
    }
  })

  return res.json({
    data, meta: { pagination },
  })
})
