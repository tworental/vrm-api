const createError = require('../services/errors')
const { CODES, MESSAGES } = require('../services/errorCodes')
const { LIMITS } = require('../models/v1/limits/constants')

module.exports = async ({ user, limits }, res, next) => {
  const limit = (limits || []).find(({ name }) => name === LIMITS.APP_PHONE_VERIFICATION_ENABLED)

  // NOTE: We check phone number verification only when the limit exists and has value === '1'
  if (limit && limit.value === '1' && !user.phoneNumberVerifiedAt) {
    return next(createError(422, MESSAGES.PHONE_NUMBER_UNVERIFIED, { code: CODES.PHONE_NUMBER_UNVERIFIED }))
  }
  return next()
}
