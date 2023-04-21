const { checkModule } = require('../../../services/authorizers')
const { LIMITS } = require('../limits/constants')

exports.module = [
  LIMITS.APP_COMPANIES_ENABLED,
  checkModule,
]
