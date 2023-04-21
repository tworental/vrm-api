const config = require('config')

const { MESSAGES, CODES } = require('../../../../../../../../services/errorCodes')
const createError = require('../../../../../../../../services/errors')
const { handler } = require('../../../../../../../../services/http')
const { sendMail } = require('../../../../../../../../services/mailing')
const { frontendUrl, domainName } = require('../../../../../../../../services/frontend')
const { selectOneWithAccount } = require('../../../../../../../../models/v1/users/repositories')
const { createToken } = require('../../../../../../../../models/v1/user-tokens/repositories')
const { EMAIL_TEMPLATES } = require('../../../../../../../../models/v1/users/constants')
const { TOKEN_TYPES } = require('../../../../../../../../models/v1/user-tokens/constants')

module.exports = handler(async ({ body: { email }, headers }, res) => {
  const identifier = headers['x-org-id']

  const user = await selectOneWithAccount({ email, identifier })
    .whereNull('confirmedAt')

  if (!user) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { email: ['invalid'] },
    })
  }

  const { id, firstName } = user

  const domain = domainName(config.get('frontend.app.endpoint'), identifier)

  const token = await createToken(id, email, TOKEN_TYPES.CONFIRMATION)

  const confirmationUrl = frontendUrl(
    config.get('frontend.app.endpoint'),
    identifier,
    config.get('frontend.app.paths.accountConfirmation'),
    { email, token },
  )

  await sendMail(EMAIL_TEMPLATES.ACCOUNT_CONFIRMATION, headers.lang, email, {
    confirmationUrl,
    firstName,
    email,
    domain,
  })

  return res.sendStatus(202)
})
