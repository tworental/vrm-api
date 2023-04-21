const { checkQuota } = require('../../../services/authorizers')
const { selectBy } = require('./repositories')
const { LIMITS } = require('../limits/constants')

exports.quota = [
  LIMITS.APP_PROPERTIES_UNITS_SIZE_LIMIT,

  checkQuota(({ params: { propertyId, propertyUnitTypeId } }) => (
    selectBy({ propertyId, propertyUnitTypeId })
  )),
]
