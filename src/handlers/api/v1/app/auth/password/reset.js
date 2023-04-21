const config = require('config')

const createError = require('../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { sendMail } = require('../../../../../../services/mailing')
const { frontendUrl } = require('../../../../../../services/frontend')
const { debugInfo } = require('../../../../../../services/debug')
const { selectOneWithAccount } = require('../../../../../../models/v1/users/repositories')
const { createToken } = require('../../../../../../models/v1/user-tokens/repositories')
const { EMAIL_TEMPLATES } = require('../../../../../../models/v1/users/constants')
const { TOKEN_TYPES } = require('../../../../../../models/v1/user-tokens/constants')

module.exports = handler(async ({ body: { email }, headers }, res) => {
  const identifier = headers['x-org-id']

  const user = await selectOneWithAccount({ email, identifier })

  if (!user) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { email: ['invalid'] },
    })
  }

  const { id, firstName } = user

  const token = await createToken(id, email, TOKEN_TYPES.RESET)

  const changePasswordUrl = frontendUrl(
    config.get('frontend.app.endpoint'),
    identifier,
    config.get('frontend.app.paths.changePassword'),
    { email, token },
  )

  const resetPasswordUrl = frontendUrl(
    config.get('frontend.app.endpoint'),
    identifier,
    config.get('frontend.app.paths.resetPassword'),
  )

  await sendMail(EMAIL_TEMPLATES.REQUEST_RESET_PASSWORD, headers.lang, email, {
    changePasswordUrl,
    resetPasswordUrl,
    firstName,
    email,
  })

  // NOTE: Inside headers we are keeping an extra information for a QA team
  debugInfo(res, { resetPasswordUrl })

  return res.sendStatus(202)
})
