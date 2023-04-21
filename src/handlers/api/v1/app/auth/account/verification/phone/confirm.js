const cache = require('../../../../../../../../services/cacheManager')
const createError = require('../../../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../../services/http')
const { validate } = require('../../../../../../../../services/validate')
const {
  checkVerificationCode,
  throwVonageError,
} = require('../../../../../../../../services/vonage')
const {
  updateBy: updateUserBy,
} = require('../../../../../../../../models/v1/users/repositories')
const {
  deleteBy: deleteTokenBy,
  selectLastBy: selectLastTokenBy,
} = require('../../../../../../../../models/v1/user-tokens/repositories')
const { TOKEN_TYPES } = require('../../../../../../../../models/v1/user-tokens/constants')
const { VERIFICATION_SCHEMA } = require('../../../../../../../../models/v1/user-tokens/schema')

module.exports = handler(async ({ body, user: { id: userId, accountId } }, res) => {
  const { code, phoneNumber, token } = await validate(body, { schema: VERIFICATION_SCHEMA })

  const userToken = await selectLastTokenBy({
    userId,
    token,
    value: phoneNumber,
    type: TOKEN_TYPES.PHONE_VERIFICATION,
  })

  if (!userToken) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { code: ['invalid'] },
    })
  }

  try {
    await checkVerificationCode(userToken.token, code)

    await updateUserBy({ id: userId }, {
      phoneNumberVerifiedAt: new Date(Date.now()),
      phoneNumber,
    })

    await deleteTokenBy({
      userId,
      type: TOKEN_TYPES.PHONE_VERIFICATION,
    })
  } catch (err) {
    await throwVonageError(err)
  }

  cache.del(`accounts.${accountId}.users.${userId}`)

  return res.sendStatus(202)
})
