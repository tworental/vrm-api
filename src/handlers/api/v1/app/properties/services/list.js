const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const {
  selectBy: selectPropertyServices,
  withServices,
} = require('../../../../../../models/v1/property-services/repositories')
const { selectBy: selectServiceRemindersBy } = require('../../../../../../models/v1/service-reminders/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/property-services/serializers')

module.exports = handler(async ({
  params: { propertyId }, account: { id: accountId },
}, res) => {
  if (!await selectProperty({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const results = await withServices(
    selectPropertyServices({ propertyId }),
  )

  const serviceReminders = await selectServiceRemindersBy()
    .whereIn('serviceId', results.map(({ serviceId }) => serviceId))

  const services = results.map((service) => {
    const totalReminders = serviceReminders
      .filter(({ serviceId }) => serviceId === service.serviceId)
      .length

    return { ...service, totalReminders }
  })

  return res.json({
    data: serialize(PERMITED_COLLECTION_PARAMS, services),
  })
})
