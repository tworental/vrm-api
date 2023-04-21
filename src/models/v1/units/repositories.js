const { raw, select } = require('../../../services/database')
const dao = require('../../../services/dao')

const { TABLE_NAME: UNITS_TABLE_NAME } = require('./constants')
const { TABLE_NAME: UNIT_TYPES_TABLE_NAME } = require('../unit-types/constants')
const { TABLE_NAME: PROPERTIES_TABLE_NAME } = require('../properties/constants')

// TODO: remove this method when "withProperty" will be replaced everywhere
const selectWithPropertiesBy = (conditions, trx) => select(UNITS_TABLE_NAME, conditions, trx)
  .join(PROPERTIES_TABLE_NAME, `${PROPERTIES_TABLE_NAME}.id`, `${UNITS_TABLE_NAME}.property_id`)
  .select([
    `${UNITS_TABLE_NAME}.*`,
    `${PROPERTIES_TABLE_NAME}.account_id`,
    raw(`${PROPERTIES_TABLE_NAME}.name AS propertyName`),
  ])

const withProperty = (queryBuilder) => (
  queryBuilder
    .join(PROPERTIES_TABLE_NAME, `${PROPERTIES_TABLE_NAME}.id`, `${UNITS_TABLE_NAME}.property_id`)
    .select([
      `${PROPERTIES_TABLE_NAME}.account_id`,
      `${PROPERTIES_TABLE_NAME}.multiple_unit_types`,
      raw(`${PROPERTIES_TABLE_NAME}.name AS property_name`),
    ])
)

const withUnitType = (queryBuilder) => (
  queryBuilder
    .join(UNIT_TYPES_TABLE_NAME, `${UNIT_TYPES_TABLE_NAME}.id`, `${UNITS_TABLE_NAME}.property_unit_type_id`)
    .select([
      raw(`${UNIT_TYPES_TABLE_NAME}.is_completed AS property_unit_type_completed`),
      raw(`${UNIT_TYPES_TABLE_NAME}.name AS property_unit_type_name`),
    ])
)

const completenessDetails = async (unit) => {
  let overview = false

  if (unit) {
    overview = Boolean(unit.name && unit.area)
  }
  return { overview }
}

module.exports = dao({
  tableName: UNITS_TABLE_NAME,
  softDelete: true,
  methods: {
    selectWithPropertiesBy,
    withProperty,
    withUnitType,
    completenessDetails,
  },
})
