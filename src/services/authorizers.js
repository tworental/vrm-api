const createError = require('./errors')
const { MESSAGES, CODES } = require('./errorCodes')

exports.checkModule = (value) => Number(value) === 1

exports.checkQuota = (handler) => async (value, req) => {
  if (!req.user) {
    throw createError(401, MESSAGES.UNAUTHORIZED, {
      code: CODES.UNAUTHORIZED,
    })
  }

  const data = await handler(req, value)

  if (Array.isArray(data) && data.length >= Number(value)) {
    throw createError(422, MESSAGES.QUOTA_EXCEEDED, {
      code: CODES.QUOTA_EXCEEDED,
    })
  }
  return true
}
