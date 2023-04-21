const { checkModule, checkQuota } = require('../../../services/authorizers')
const { selectBy } = require('./repositories')
const { LIMITS } = require('../limits/constants')

exports.module = [
  LIMITS.APP_RATE_SEASONS_ENABLED,
  checkModule,
]

exports.quota = [
  LIMITS.APP_PROPERTIES_UNIT_TYPES_SEASONS_SIZE_LIMIT,

  checkQuota(({ user, params: { propertyUnitTypeId } }) => (
    selectBy({ accountId: user.accountId, propertyUnitTypeId })
  )),
]
