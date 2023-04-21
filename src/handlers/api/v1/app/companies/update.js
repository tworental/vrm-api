const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { selectOneBy, updateBy } = require('../../../../../models/v1/companies/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/companies/schema')

module.exports = handler(async ({ body, user: { accountId }, params: { id } }, res) => {
  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  if (!await selectOneBy({ accountId, id })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (payload.name) {
    if (await selectOneBy({ accountId, name: payload.name }).where('id', '!=', id)) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { name: ['exists'] },
      })
    }
  }

  await updateBy({ id }, payload)

  return res.sendStatus(204)
})
