const { checkModule } = require('../../../services/authorizers')
const { LIMITS } = require('../limits/constants')

exports.module = [
  LIMITS.APP_SERVICES_ENABLED,
  checkModule,
]
