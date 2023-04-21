const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const { selectOneBy, updateBy } = require('../../../../../models/v1/users/repositories')
const { setPermissions } = require('../../../../../models/v1/permission-users/repositories')
const { EMAIL_TEMPLATES } = require('../../../../../models/v1/users/constants')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/users/schema')

module.exports = handler(async ({
  body, headers: { lang }, params: { id }, account: { identifier }, user,
}, res) => {
  if (!user.isAccountOwner || user.id === id) {
    throw createError(403, MESSAGES.FORBIDDEN, { code: CODES.FORBIDDEN })
  }

  const member = await selectOneBy({ id })
    .where('id', '!=', user.id)

  if (!member) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const { accountId } = user
  const { isAccountOwner, permissions } = await validate(body, { schema: UPDATE_SCHEMA })

  await createTransaction(async (trx) => {
    if (isAccountOwner) {
      await updateBy({ accountId }, { isAccountOwner: 0 }, trx)
      await updateBy({ accountId, id }, { isAccountOwner }, trx)
    }
    await setPermissions(accountId, id, permissions, trx)
  })

  await sendMail(EMAIL_TEMPLATES.CHANGE_ACCOUNT_OWNER, lang, member.email, {
    firstName: member.firstName,
    email: user.email,
    identifier,
    isAccountOwner,
  })

  return res.sendStatus(200)
})
