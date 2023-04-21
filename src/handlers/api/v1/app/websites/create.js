const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const {
  create: createWebsiteBy,
  selectOneBy: selectWebsiteBy,
} = require('../../../../../models/v1/websites/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/websites/schema')

module.exports = handler(async ({ user: { accountId }, body }, res) => {
  const payload = await validate(body, { schema: CREATE_SCHEMA })

  if (await selectWebsiteBy({ accountId, name: payload.name })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { name: ['unique'] },
    })
  }

  const id = await createWebsiteBy({ ...payload, accountId })

  return res.status(201)
    .json({ data: { id } })
})
