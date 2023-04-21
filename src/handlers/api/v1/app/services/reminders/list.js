const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectServiceBy } = require('../../../../../../models/v1/services/repositories')
const { selectBy: selectServiceRemindersBy } = require('../../../../../../models/v1/service-reminders/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/service-reminders/serializers')

module.exports = handler(async ({ user: { accountId }, params: { serviceId } }, res) => {
  if (!await selectServiceBy({ id: serviceId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await selectServiceRemindersBy({ serviceId })
    .then((results) => serialize(PERMITED_COLLECTION_PARAMS, results))

  return res.json({ data })
})
