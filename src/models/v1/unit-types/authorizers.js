const { checkQuota } = require('../../../services/authorizers')
const { selectBy } = require('./repositories')
const { LIMITS } = require('../limits/constants')

exports.quota = [
  LIMITS.APP_PROPERTIES_UNIT_TYPES_SIZE_LIMIT,

  checkQuota(({ params: { propertyId } }) => (
    selectBy({ propertyId })
  )),
]
