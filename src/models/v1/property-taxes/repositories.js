const dao = require('../../../services/dao')

const { TABLE_NAME: PROPERTY_TAXES_TABLE_NAME } = require('./constants')
const { TABLE_NAME: TAXES_TABLE_NAME } = require('../taxes/constants')

const withTaxes = (queryBuilder) => (
  queryBuilder
    .join(TAXES_TABLE_NAME, `${TAXES_TABLE_NAME}.id`, `${PROPERTY_TAXES_TABLE_NAME}.tax_id`)
    .clearSelect()
    .select(`${TAXES_TABLE_NAME}.*`)
)

module.exports = dao({
  tableName: PROPERTY_TAXES_TABLE_NAME,
  methods: {
    withTaxes,
  },
})
