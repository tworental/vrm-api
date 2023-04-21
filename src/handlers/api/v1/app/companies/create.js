const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { create, selectOneBy } = require('../../../../../models/v1/companies/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/companies/schema')

module.exports = handler(async ({ body, user: { accountId } }, res) => {
  const payload = await validate(body, { schema: CREATE_SCHEMA })

  if (await selectOneBy({ accountId, name: payload.name })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { name: ['exists'] },
    })
  }

  const id = await create({ ...payload, accountId })

  return res.status(201).json({ data: { id } })
})
