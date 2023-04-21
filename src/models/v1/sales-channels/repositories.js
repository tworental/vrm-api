const { insert } = require('../../../services/database')
const dao = require('../../../services/dao')

const DEFAULT_FIXTURES = require('../../../__fixtures__/salesChannels')
const { TABLE_NAME } = require('./constants')

const createDefaults = (accountId, trx) => Promise.all(DEFAULT_FIXTURES.map((data) => (
  insert(TABLE_NAME, { ...data, accountId }, trx)
)))

module.exports = dao({
  tableName: TABLE_NAME,
  methods: {
    createDefaults,
  },
})
