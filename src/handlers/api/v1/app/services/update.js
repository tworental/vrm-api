const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const {
  updateBy: updateServiceBy,
  selectOneBy: selectServiceBy,
} = require('../../../../../models/v1/services/repositories')
const {
  selectOneBy: selectServiceProviderBy,
} = require('../../../../../models/v1/service-providers/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/services/schema')

module.exports = handler(async ({ user: { accountId }, params: { id }, body }, res) => {
  if (!await selectServiceBy({ accountId, id })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  if (payload.name) {
    if (await selectServiceBy({ accountId, name: payload.name }).where('id', '!=', id)) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { name: ['unique'] },
      })
    }
  }

  if (payload.serviceProviderId) {
    if (!await selectServiceProviderBy({ id: payload.serviceProviderId, accountId })) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { serviceProviderId: ['notExists'] },
      })
    }
  }

  await updateServiceBy({ id }, payload)

  return res.sendStatus(200)
})
