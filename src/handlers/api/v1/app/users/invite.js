const config = require('config')
const crypto = require('crypto')

const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { frontendUrl } = require('../../../../../services/frontend')
const { selectOneBy: selectUserBy } = require('../../../../../models/v1/users/repositories')
const { createToken } = require('../../../../../models/v1/user-tokens/repositories')
const { TOKEN_TYPES } = require('../../../../../models/v1/user-tokens/constants')
const { EMAIL_TEMPLATES } = require('../../../../../models/v1/users/constants')

module.exports = handler(async ({
  params, headers: { lang }, account: { identifier }, user: { id, accountId, email },
}, res) => {
  const user = await selectUserBy({ accountId, id: params.id })
    .where('id', '!=', id)

  if (!user) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const token = await createToken(user.id, email, TOKEN_TYPES.CONFIRMATION)

  const confirmationUrl = frontendUrl(
    config.get('frontend.app.endpoint'),
    identifier,
    config.get('frontend.app.paths.accountConfirmation'),
    { email: user.email, token },
  )

  const password = crypto.randomBytes(12).toString('hex')

  await sendMail(EMAIL_TEMPLATES.TEAM_INVITATION, lang, user.email, {
    email,
    confirmationUrl,
    identifier,
    password,
  })

  return res.sendStatus(202)
})
