const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy: selectServiceBy } = require('../../../../../models/v1/services/repositories')
const { selectBy: selectServiceRemindersBy } = require('../../../../../models/v1/service-reminders/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/services/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const service = await selectServiceBy({ id, accountId })

  if (!service) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const reminders = await selectServiceRemindersBy({ serviceId: service.id })

  return res.json({
    data: serialize(PERMITED_ITEM_PARAMS, service, { reminders }),
  })
})
