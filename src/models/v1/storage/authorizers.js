const { checkModule, checkQuota } = require('../../../services/authorizers')
const { sum } = require('./files/repositories')
const { LIMITS } = require('../limits/constants')

exports.module = [
  LIMITS.APP_STORAGE_ENABLED,
  checkModule,
]

exports.quota = [
  LIMITS.APP_STORAGE_QUOTA,

  checkQuota(({ user }) => (
    sum('size', { accountId: user.accountId })
  )),
]
