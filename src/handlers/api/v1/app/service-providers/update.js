const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { updateBy, selectOneBy } = require('../../../../../models/v1/service-providers/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/service-providers/schema')

module.exports = handler(async ({ user: { accountId }, params: { id }, body }, res) => {
  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  const service = await selectOneBy({ accountId, id })

  if (!service) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await updateBy({ id: service.id }, payload)

  return res.sendStatus(200)
})
