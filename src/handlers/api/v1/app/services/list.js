const { raw } = require('../../../../../services/database')
const { handler } = require('../../../../../services/http')
const { selectBy: selectServicesBy } = require('../../../../../models/v1/services/repositories')
const { selectBy: selectServiceRemindersBy } = require('../../../../../models/v1/service-reminders/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/services/serializers')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const results = await selectServicesBy()
    .leftJoin('service_providers', 'service_providers.id', 'services.serviceProviderId')
    .select(['services.*', raw('service_providers.name AS serviceProviderName')])
    .where('services.accountId', accountId)

  const serviceReminders = await selectServiceRemindersBy()
    .whereIn('serviceId', results.map(({ id }) => id))

  const services = results.map((service) => {
    const totalReminders = serviceReminders
      .filter(({ serviceId }) => serviceId === service.id)
      .length

    return { ...service, totalReminders }
  })

  return res.json({
    data: serialize(PERMITED_COLLECTION_PARAMS, services),
  })
})
