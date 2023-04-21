const config = require('config')
const crypto = require('crypto')

const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { validate } = require('../../../../../services/validate')
const { frontendUrl } = require('../../../../../services/frontend')
const { createTransaction } = require('../../../../../services/database')
const { create: createUser, selectOneBy: selectUserBy } = require('../../../../../models/v1/users/repositories')
const { create: createUserSettings } = require('../../../../../models/v1/user-settings/repositories')
const { setPermissions } = require('../../../../../models/v1/permission-users/repositories')
const { createToken } = require('../../../../../models/v1/user-tokens/repositories')
const { getLimitByKey } = require('../../../../../models/v1/limits/repositories')
const {
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  DEFAULT_LANGUAGE,
} = require('../../../../../models/v1/account-settings/constants')
const { TOKEN_TYPES } = require('../../../../../models/v1/user-tokens/constants')
const { EMAIL_TEMPLATES } = require('../../../../../models/v1/users/constants')
const { INVITATION_SCHEMA } = require('../../../../../models/v1/users/schema')
const { LIMITS } = require('../../../../../models/v1/limits/constants')

module.exports = handler(async ({
  body,
  limits,
  headers: { lang },
  account: { identifier },
  user: {
    accountId,
    email: loggedUserEmail,
    settings,
  },
}, res) => {
  // TODO: check validation for array when permissions abilities exists and name is not in payload
  const { email, permissions = [] } = await validate(body, { schema: INVITATION_SCHEMA })

  if (await selectUserBy({ accountId, email })) {
    throw createError(400, 'User already exists')
  }

  const password = crypto.randomBytes(12).toString('hex')

  const token = await createTransaction(async (trx) => {
    const userId = await createUser({
      accountId, email, password, isAccountOwner: false,
    }, trx)

    const locale = settings.locale || DEFAULT_LOCALE
    const timezone = settings.timezone || DEFAULT_TIMEZONE
    const language = settings.language || getLimitByKey(LIMITS.APP_LANGUAGES_DEFAULT, limits, DEFAULT_LANGUAGE)

    await createUserSettings({
      userId, timezone, locale, language,
    }, trx)

    await setPermissions(accountId, userId, permissions, trx)

    return createToken(userId, email, TOKEN_TYPES.CONFIRMATION, trx)
  })

  const confirmationUrl = frontendUrl(
    config.get('frontend.app.endpoint'),
    identifier,
    config.get('frontend.app.paths.accountConfirmation'),
    { email, token },
  )

  await sendMail(EMAIL_TEMPLATES.TEAM_INVITATION, lang, email, {
    email: loggedUserEmail,
    confirmationUrl,
    identifier,
    password,
  })

  return res.sendStatus(201)
})
