const { raw } = require('../../../services/database')
const dao = require('../../../services/dao')

const { TABLE_NAME: CHANNEL_MANAGERS_TABLE_NAME } = require('./constants')
const { TABLE_NAME: CHANNEL_MANAGER_ACCOUNTS_TABLE_NAME } = require('../channel-manager-accounts/constants')

const withAccount = (accountId) => (queryBuilder) => (
  queryBuilder
    .leftJoin(CHANNEL_MANAGER_ACCOUNTS_TABLE_NAME, (builder) => {
      builder.on(`${CHANNEL_MANAGERS_TABLE_NAME}.id`, `${CHANNEL_MANAGER_ACCOUNTS_TABLE_NAME}.channel_manager_id`)
        .on('account_id', accountId)
    })
    .clearSelect()
    .select([
      `${CHANNEL_MANAGERS_TABLE_NAME}.*`,
      raw(`IFNULL(${CHANNEL_MANAGER_ACCOUNTS_TABLE_NAME}.enabled, false) AS enabled`),
    ])
    .where(`${CHANNEL_MANAGERS_TABLE_NAME}.enabled`, '=', 1)
)

module.exports = dao({
  tableName: CHANNEL_MANAGERS_TABLE_NAME,
  methods: {
    withAccount,
  },
})
