const createError = require('../services/errors')
const {
  parseToken,
  authByUserJwt,
  authByOwnerJwt,
  authByTenantJwt,
} = require('../services/auth')
const cache = require('../services/cacheManager')
const { selectOneBy: selectAccountBy } = require('../models/v1/accounts/repositories')
const { selectOneBy: selectUserBy } = require('../models/v1/users/repositories')
const { selectOneBy: selectOwnerBy } = require('../models/v1/owners/repositories')
const { selectOneBy: selectAccountSettingsBy } = require('../models/v1/account-settings/repositories')
const { selectOneBy: selectUserSettingsBy } = require('../models/v1/user-settings/repositories')
const { selectOneBy: selectOwnerSettingsBy } = require('../models/v1/owner-settings/repositories')
const { selectLimits } = require('../models/v1/limits/repositories')

exports.jwtUserGuard = async (req, res, next) => {
  try {
    // Get auth details from JWT token
    req.auth = await parseToken(req)
      .then(authByUserJwt)

    // Get informations about account which user is belongs to
    req.account = await cache.wrap(`accounts.${req.auth.iss}.${req.auth.jti}`, () => (
      selectAccountBy({ identifier: req.auth.iss })
    ))

    if (!req.account) {
      return next(createError(401, 'Missing or malformed token'))
    }

    // Get limits for logged in account
    req.limits = await cache.wrap(`accounts.${req.account.id}.limits`, () => selectLimits({
      accountId: req.account.id,
      packageId: req.account.packageId,
    }))

    // Get user by details from JWT
    req.user = await cache.wrap(`accounts.${req.account.id}.users.${req.auth.sub}`, () => (
      selectUserBy({ id: req.auth.sub, accountId: req.account.id })
        .whereNull('lockedAt')
        .whereNotNull('confirmedAt')
    ))

    if (!req.user) {
      return next(createError(401, 'Missing or malformed token'))
    }

    // Assign the user settings to user object
    req.user.settings = await cache.wrap(`accounts.${req.account.id}.users.${req.auth.sub}.settings`, () => (
      selectUserSettingsBy({ userId: req.user.id })
    ))

    // Assign the account settings to account object
    req.account.settings = await cache.wrap(`accounts.${req.account.id}.settings`, () => (
      selectAccountSettingsBy({ accountId: req.account.id })
    ))

    return next()
  } catch (error) {
    return next(error)
  }
}

exports.jwtOwnerGuard = async (req, res, next) => {
  try {
    req.auth = await parseToken(req)
      .then(authByOwnerJwt)

    // Get informations about account which user is belongs to
    req.account = await selectAccountBy({
      identifier: req.auth.iss,
    })

    if (!req.account) {
      return next(createError(401, 'Missing or malformed token'))
    }

    // Get limits for logged in account
    req.limits = await selectLimits({
      accountId: req.account.id,
      packageId: req.account.packageId,
    })

    // Get owner by details from JWT
    req.user = await selectOwnerBy({ id: req.auth.sub, accountId: req.account.id, hasPanelAccess: 1 })
      .whereNull('lockedAt')
      .whereNotNull('confirmedAt')

    if (!req.user) {
      return next(createError(401, 'Missing or malformed token'))
    }

    // Assign the owner settings to user object
    req.user.settings = await selectOwnerSettingsBy({ ownerId: req.user.id })

    // Assign the account settings to account object
    req.account.settings = await selectAccountSettingsBy({ accountId: req.account.id })

    return next()
  } catch (error) {
    return next(error)
  }
}

exports.jwtTenantGuard = async (req, res, next) => {
  try {
    req.auth = await parseToken(req)
      .then(authByTenantJwt)

    return next()
  } catch (error) {
    return next(error)
  }
}
