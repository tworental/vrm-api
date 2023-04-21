const dao = require('../../../services/dao')

const { TABLE_NAME: PROPERTY_FEES_TABLE_NAME } = require('./constants')
const { TABLE_NAME: FEES_TABLE_NAME } = require('../fees/constants')

const withFees = (queryBuilder) => (
  queryBuilder
    .join(FEES_TABLE_NAME, `${FEES_TABLE_NAME}.id`, `${PROPERTY_FEES_TABLE_NAME}.fee_id`)
    .clearSelect()
    .select(`${FEES_TABLE_NAME}.*`)
)

module.exports = dao({
  tableName: PROPERTY_FEES_TABLE_NAME,
  methods: {
    withFees,
  },
})
