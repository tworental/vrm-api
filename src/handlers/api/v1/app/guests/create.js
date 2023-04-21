const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { upsertGuestToMailchimp } = require('../../../../../models/v1/integration-accounts/repositories')
const { create: createGuest } = require('../../../../../models/v1/guests/repositories')
const { selectOneBy: selectCompanyBy } = require('../../../../../models/v1/companies/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/guests/schema')

module.exports = handler(async ({ body, user: { accountId } }, res) => {
  const payload = await validate(body, { schema: CREATE_SCHEMA })

  if (payload.companyId) {
    if (!await selectCompanyBy({ accountId, id: payload.companyId })) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { company: ['notExists'] },
      })
    }
  }

  const { id: mailchimpId } = await upsertGuestToMailchimp(accountId)(payload)

  const id = await createGuest({ ...payload, accountId, mailchimpId })

  return res.json({ data: { id } })
})
