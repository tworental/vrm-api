const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { selectOneBy, updateById } = require('../../../../../models/v1/users/repositories')
const { EMAIL_TEMPLATES } = require('../../../../../models/v1/users/constants')

module.exports = handler(async ({
  params, headers: { lang }, account: { identifier }, user: loggedUser,
}, res) => {
  if (!loggedUser.isAccountOwner || loggedUser.id === params.id) {
    throw createError(403, MESSAGES.FORBIDDEN, { code: CODES.FORBIDDEN })
  }

  const user = await selectOneBy({ accountId: loggedUser.accountId, id: params.id })
    .where('id', '!=', loggedUser.id)

  if (!user) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await updateById(user.id, { lockedAt: new Date(Date.now()) })

  await sendMail(EMAIL_TEMPLATES.USER_LOCKED, lang, user.email, {
    identifier,
    email: loggedUser.email,
  })

  return res.sendStatus(200)
})
