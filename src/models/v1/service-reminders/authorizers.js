const { checkModule, checkQuota } = require('../../../services/authorizers')
const { selectBy } = require('./repositories')
const { LIMITS } = require('../limits/constants')

exports.module = [
  LIMITS.APP_SERVICES_REMINDERS_ENABLED,
  checkModule,
]

exports.quota = [
  LIMITS.APP_SERVICES_REMINDERS_SIZE_LIMIT,

  checkQuota(({ user }) => (
    selectBy().join('services', 'services.id', 'service_reminders.service_id')
      .where({ accountId: user.accountId })
  )),
]
