const config = require('config')

const createError = require('../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const { frontendUrl, domainName } = require('../../../../../services/frontend')
const { isEmailBlacklisted, isIpBlacklisted } = require('../../../../../services/blacklist')
const { debugInfo } = require('../../../../../services/debug')
const slack = require('../../../../../services/slack')
const { create: createUser } = require('../../../../../models/v1/users/repositories')
const { create: createUserSettings } = require('../../../../../models/v1/user-settings/repositories')
const { create: createAccountSettings } = require('../../../../../models/v1/account-settings/repositories')
const {
  create: createAccount,
  selectOneBy: getAccountBy,
  trialExpirationDate: getAccountExpirationDate,
} = require('../../../../../models/v1/accounts/repositories')
const { selectOneBy: getPackageBy } = require('../../../../../models/v1/packages/repositories')
const { createToken } = require('../../../../../models/v1/user-tokens/repositories')
const {
  createDefaults: createDefaultSalesChannels,
} = require('../../../../../models/v1/sales-channels/repositories')
const { TOKEN_TYPES } = require('../../../../../models/v1/user-tokens/constants')
const { EMAIL_TEMPLATES } = require('../../../../../models/v1/users/constants')
const { PACKAGES } = require('../../../../../models/v1/packages/constants')
const {
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  DEFAULT_LANGUAGE,
} = require('../../../../../models/v1/account-settings/constants')
const { CREATE_SCHEMA } = require('../../../../../models/v1/accounts/schema')

module.exports = handler(async ({ body, clientIp, headers: { lang: browserLang } }, res) => {
  const {
    identifier,
    email,
    password,
    phoneNumber,
    firstName,
    lastName,
    timezone = DEFAULT_TIMEZONE,
    locale = DEFAULT_LOCALE,
    language = DEFAULT_LANGUAGE,
  } = await validate(body, { schema: CREATE_SCHEMA })

  // TODO: currenctly we need to hardcode packageId because we have only one package right now.
  const { id: packageId } = await getPackageBy({ name: PACKAGES.BASIC })

  if (isEmailBlacklisted(email)) {
    throw createError(403, 'Blocked Email Address')
  }

  if (isIpBlacklisted(clientIp)) {
    throw createError(403, 'Blocked IP Address')
  }

  if (!await getPackageBy({ id: packageId })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { package: ['notExists'] },
    })
  }

  const account = await getAccountBy({ identifier })

  if (account) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { identifier: ['exists'] },
    })
  }

  const lang = config.get('locales.availableLanguages').includes(language)
    ? language : browserLang

  const token = await createTransaction(async (trx) => {
    const trialExpirationOn = getAccountExpirationDate()

    const accountId = await createAccount({
      packageId, identifier, trialExpirationOn,
    }, trx)

    const userId = await createUser({
      accountId, email, password, phoneNumber, firstName, lastName, isAccountOwner: 1,
    }, trx)

    await createUserSettings({
      userId, timezone, locale, language: lang,
    }, trx)

    await createAccountSettings({
      accountId, timezone, locale, language: lang,
    }, trx)

    await createDefaultSalesChannels(accountId, trx)

    return createToken(userId, email, TOKEN_TYPES.CONFIRMATION, trx)
  })

  const confirmationUrl = frontendUrl(
    config.get('frontend.app.endpoint'),
    identifier,
    config.get('frontend.app.paths.accountConfirmation'),
    { email, token },
  )

  const domain = domainName(config.get('frontend.app.endpoint'), identifier)

  await sendMail(EMAIL_TEMPLATES.ACCOUNT_CONFIRMATION, lang, email, {
    confirmationUrl,
    domain,
    email,
    firstName,
  })

  await slack.postMessage(
    config.get('slack.channels.signupOrders'),
    `New *FREE TRIAL* account was created: "*${identifier}*" :rocket:`,
  )

  // NOTE: Inside headers we are keeping an extra information for a QA team
  debugInfo(res, { confirmationUrl })

  return res.sendStatus(201)
})
