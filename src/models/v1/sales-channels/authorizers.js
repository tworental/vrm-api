const { checkModule } = require('../../../services/authorizers')
const { LIMITS } = require('../limits/constants')

exports.module = [
  LIMITS.APP_SALES_CHANNELS_ENABLED,
  checkModule,
]
