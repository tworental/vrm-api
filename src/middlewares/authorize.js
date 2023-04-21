const createError = require('../services/errors')
const cache = require('../services/cacheManager')
const { selectBy } = require('../models/v1/permissions/repositories')
const { ABILITIES } = require('../models/v1/permissions/constants')

module.exports = (resource) => async (req, res, next) => {
  if (!req.user || req.user.isAccountOwner) return next()

  // Get user permissions
  const permissions = await cache.wrap(`accounts.${req.account.id}.${req.auth.sub}.permissions`, () => (
    selectBy({ userId: req.auth.sub, accountId: req.account.id })
      .then((results) => results.reduce((acc, curr) => {
        acc[curr.name] = curr.abilities || Object.values(ABILITIES)
        return acc
      }, {}))
  ))

  const [name, ability] = Array.isArray(resource) ? resource : resource.split(':')

  // NOTE: Because JS doesn't protected the property of hasOwnProperty
  if (!Object.prototype.hasOwnProperty.call(permissions, name)) {
    return next()
  }

  if (!permissions[name].includes(ability)) {
    return next(createError(403, 'Access Denied'))
  }
  return next()
}
