const crypto = require('crypto')
const config = require('config')

const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { frontendUrl } = require('../../../../../services/frontend')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const {
  create: createOwner,
  selectOneBy: selectOwnerBy,
} = require('../../../../../models/v1/owners/repositories')
const {
  selectWithPropertiesBy: selectUnitsBy,
  updateBy: updateUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const {
  create: createOwnerSettings,
} = require('../../../../../models/v1/owner-settings/repositories')
const { createToken } = require('../../../../../models/v1/owner-tokens/repositories')
const { TOKEN_TYPES } = require('../../../../../models/v1/owner-tokens/constants')
const { EMAIL_TEMPLATES } = require('../../../../../models/v1/owners/constants')
const { CREATE_SCHEMA } = require('../../../../../models/v1/owners/schema')

module.exports = handler(async ({
  body, headers: { lang }, user: { accountId, settings: { timezone, locale } }, account: { identifier },
}, res) => {
  const { units: ids, ...payload } = await validate(body, { schema: CREATE_SCHEMA })

  /**
   * Extra owners validation for preventing duplicate email address in the same account
   */
  if (await selectOwnerBy({ accountId, email: payload.email })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { email: ['exists'] },
    })
  }

  /**
   * Extra owners validation for preventing duplicate phone number in the same account
   */
  if (await selectOwnerBy({ accountId, phoneNumber: payload.phoneNumber })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { phoneNumber: ['exists'] },
    })
  }

  let unitsIds = []

  if (Array.isArray(ids) && ids.length) {
    unitsIds = await selectUnitsBy({ accountId, ownerId: null })
      .then((items) => items.map((item) => item.id))
  }

  const password = crypto.randomBytes(12).toString('hex')

  await createTransaction(async (trx) => {
    const ownerId = await createOwner({
      accountId, password, ...payload,
    }, trx)

    await createOwnerSettings({
      ownerId, timezone, locale,
    }, trx)

    if (unitsIds.length) {
      await updateUnitsBy({}, { ownerId }, trx)
        .whereIn('id', unitsIds.filter((unitId) => ids.includes(unitId)))
    }

    if (payload.hasPanelAccess) {
      const token = await createToken(ownerId, payload.email, TOKEN_TYPES.CONFIRMATION, trx)

      const confirmationUrl = frontendUrl(
        config.get('frontend.owners.endpoint'),
        identifier,
        config.get('frontend.owners.paths.accountConfirmation'),
        { email: payload.email, token },
      )

      await sendMail(EMAIL_TEMPLATES.APP_INVITATION, lang, payload.email, {
        firstName: payload.firstName,
        identifier,
        confirmationUrl,
        password,
        email: payload.email,
      })
    }
  })

  return res.sendStatus(201)
})
