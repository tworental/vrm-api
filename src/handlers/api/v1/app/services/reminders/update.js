const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { selectOneBy: selectServiceBy } = require('../../../../../../models/v1/services/repositories')
const { updateBy: updateServiceReminderBy } = require('../../../../../../models/v1/service-reminders/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/service-reminders/schema')

module.exports = handler(async ({ user: { accountId }, params: { id, serviceId }, body }, res) => {
  if (!await selectServiceBy({ id: serviceId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  await updateServiceReminderBy({ id, serviceId }, payload)

  return res.sendStatus(200)
})
