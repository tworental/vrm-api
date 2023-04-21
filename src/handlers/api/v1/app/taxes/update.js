const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { updateBy, selectOneBy } = require('../../../../../models/v1/taxes/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/taxes/schema')

module.exports = handler(async ({ user: { accountId }, params: { id }, body }, res) => {
  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  if (!await selectOneBy({ accountId, id })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (payload.name) {
    if (await selectOneBy({ accountId, name: payload.name }).where('id', '!=', id)) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { name: ['unique'] },
      })
    }
  }

  await updateBy({ id }, payload)

  return res.sendStatus(200)
})
