const createError = require('../services/errors')
const { logInfo } = require('../services/logger')

module.exports = ([limitName, fn]) => async (req, res, next) => {
  const limit = (req.limits || []).find(({ name }) => name === limitName)

  if (!limit || typeof limit.value === 'undefined') {
    logInfo({
      message: 'Forbidden',
      payload: { limitName, limit, limits: req.limits },
    })

    return next(createError(403))
  }

  try {
    if (typeof fn !== 'undefined' && !await fn(limit.value, req)) {
      return next(createError(403))
    }

    return next()
  } catch (error) {
    return next(error)
  }
}
