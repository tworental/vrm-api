const { checkModule, checkQuota } = require('../../../services/authorizers')
const { selectBy } = require('./repositories')
const { LIMITS } = require('../limits/constants')

exports.module = [
  LIMITS.APP_TEAM_ENABLED,
  checkModule,
]

exports.quota = [
  LIMITS.APP_TEAM_SIZE_LIMIT,

  checkQuota(({ user }) => (
    selectBy({ accountId: user.accountId }).where('id', '!=', user.id)
  )),
]
