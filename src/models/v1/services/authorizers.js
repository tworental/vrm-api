const { checkModule, checkQuota } = require('../../../services/authorizers')
const { selectBy } = require('./repositories')
const { LIMITS } = require('../limits/constants')

exports.module = [
  LIMITS.APP_SERVICES_ENABLED,
  checkModule,
]

exports.quota = [
  LIMITS.APP_SERVICES_SIZE_LIMIT,

  checkQuota(({ user }) => (
    selectBy({ accountId: user.accountId })
  )),
]
