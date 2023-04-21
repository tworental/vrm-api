const createError = require('../../../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../../services/http')
const {
  requestVerificationCode,
  cancelVerificationCode,
  throwVonageError,
  TOKEN_EXPIRATION_TIME,
} = require('../../../../../../../../services/vonage')
const {
  create: createToken,
  deleteBy: deleteTokenBy,
  selectLastBy: selectLastTokenBy,
} = require('../../../../../../../../models/v1/user-tokens/repositories')
const { TOKEN_TYPES } = require('../../../../../../../../models/v1/user-tokens/constants')

module.exports = handler(async ({ body: { phoneNumber }, user: { id: userId } }, res) => {
  if (!phoneNumber) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { phoneNumber: ['required'] },
    })
  }

  const lastVerificationToken = await selectLastTokenBy({
    userId,
    value: phoneNumber,
    type: TOKEN_TYPES.PHONE_VERIFICATION,
  })

  if (lastVerificationToken) {
    await cancelVerificationCode(lastVerificationToken.token)
      .then(() => deleteTokenBy({ id: lastVerificationToken.id }))
      .catch(() => {})
  }

  let token

  try {
    token = await requestVerificationCode(phoneNumber)
      .then((results) => results.requestId)

    await createToken({
      userId,
      token,
      value: phoneNumber,
      type: TOKEN_TYPES.PHONE_VERIFICATION,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRATION_TIME * 1000),
    })
  } catch (err) {
    await throwVonageError(err)
  }

  return res.status(202).json({
    data: {
      token,
      expiresAt: TOKEN_EXPIRATION_TIME,
    },
  })
})
