const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { upsertGuestToMailchimp } = require('../../../../../models/v1/integration-accounts/repositories')
const {
  selectOneBy: selectGuestBy,
  updateBy: updateGuestBy,
} = require('../../../../../models/v1/guests/repositories')
const {
  selectOneBy: selectCompanyBy,
} = require('../../../../../models/v1/companies/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/guests/schema')

module.exports = handler(async ({ body, user: { accountId }, params: { id } }, res) => {
  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  const guest = await selectGuestBy({ accountId, id })

  if (!guest) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (payload.companyId) {
    if (!await selectCompanyBy({ accountId, id: payload.companyId })) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { company: ['notExists'] },
      })
    }
  }

  if (guest.mailchimpId) {
    await upsertGuestToMailchimp(accountId)({ ...guest, ...payload })
  }

  await updateGuestBy({ id, accountId }, payload)

  return res.sendStatus(204)
})
