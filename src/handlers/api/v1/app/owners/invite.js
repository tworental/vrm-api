const crypto = require('crypto')
const config = require('config')

const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { frontendUrl } = require('../../../../../services/frontend')
const { selectOneBy } = require('../../../../../models/v1/owners/repositories')
const { createToken } = require('../../../../../models/v1/owner-tokens/repositories')
const { TOKEN_TYPES } = require('../../../../../models/v1/owner-tokens/constants')
const { EMAIL_TEMPLATES } = require('../../../../../models/v1/owners/constants')

module.exports = handler(async ({
  user: { accountId }, headers: { lang }, params: { id }, account: { identifier },
}, res) => {
  const owner = await selectOneBy({ accountId, id })

  if (!owner) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const { firstName, email } = owner
  const password = crypto.randomBytes(12).toString('hex')

  const token = await createToken(id, email, TOKEN_TYPES.CONFIRMATION)

  const confirmationUrl = frontendUrl(
    config.get('frontend.owners.endpoint'),
    identifier,
    config.get('frontend.owners.paths.accountConfirmation'),
    { email, token },
  )

  await sendMail(EMAIL_TEMPLATES.APP_INVITATION, lang, email, {
    firstName,
    identifier,
    confirmationUrl,
    password,
    email,
  })

  return res.sendStatus(202)
})
