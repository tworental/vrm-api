const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { selectOneBy, updateById } = require('../../../../../models/v1/owners/repositories')
const { EMAIL_TEMPLATES } = require('../../../../../models/v1/owners/constants')

module.exports = handler(async ({
  params: { id }, headers: { lang }, account: { identifier }, user: { accountId },
}, res) => {
  const owner = await selectOneBy({ accountId, id })

  if (!owner) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await updateById(owner.id, { lockedAt: null })

  await sendMail(EMAIL_TEMPLATES.OWNER_UNLOCKED, lang, owner.email, {
    identifier,
  })

  return res.sendStatus(200)
})
