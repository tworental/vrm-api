const { raw } = require('../../../services/database')
const dao = require('../../../services/dao')

const { TABLE_NAME: INTEGRATIONS_TABLE_NAME } = require('./constants')
const { TABLE_NAME: INTEGRATION_ACCOUNTS_TABLE_NAME } = require('../integration-accounts/constants')

const withAccount = (accountId) => (queryBuilder) => (
  queryBuilder
    .leftJoin(INTEGRATION_ACCOUNTS_TABLE_NAME, (builder) => {
      builder.on(`${INTEGRATIONS_TABLE_NAME}.id`, `${INTEGRATION_ACCOUNTS_TABLE_NAME}.integration_id`)
        .on('account_id', accountId)
    })
    .clearSelect()
    .select([
      `${INTEGRATIONS_TABLE_NAME}.*`,
      raw(`IFNULL(${INTEGRATION_ACCOUNTS_TABLE_NAME}.enabled, false) AS enabled`),
    ])
    .where(`${INTEGRATIONS_TABLE_NAME}.enabled`, '=', 1)
)

module.exports = dao({
  tableName: INTEGRATIONS_TABLE_NAME,
  methods: {
    withAccount,
  },
})
