const { PACKAGES } = require('../models/v1/packages/constants')

module.exports = [
  {
    stripe_id: null,
    name: PACKAGES.BASIC,
    description: `The ${PACKAGES.BASIC} service with extra features`,
  },
  {
    stripe_id: null,
    name: PACKAGES.PROFESSIONAL,
    description: `The ${PACKAGES.PROFESSIONAL} service with extra features`,
  },
  {
    stripe_id: null,
    name: PACKAGES.ENTERPRISE,
    description: `The ${PACKAGES.ENTERPRISE} service with extra features`,
  },
].map((data, index) => ({ id: (index + 1), ...data }))
