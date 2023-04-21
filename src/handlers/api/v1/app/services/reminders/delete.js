const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectServiceBy } = require('../../../../../../models/v1/services/repositories')
const {
  selectOneBy: selectServiceReminderBy,
  deleteBy: deleteServiceReminderBy,
} = require('../../../../../../models/v1/service-reminders/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id, serviceId } }, res) => {
  if (!await selectServiceBy({ id: serviceId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const reminder = await selectServiceReminderBy({ id, serviceId })

  if (!reminder) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deleteServiceReminderBy({ id, serviceId })

  return res.sendStatus(204)
})
