const cache = require('../../../../../services/cacheManager')
const createError = require('../../../../../services/errors')
const dayjs = require('../../../../../services/dayjs')
const { updateAvailability } = require('../../../../../services/channex')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/bookings/repositories')
const { selectOneBy: selectPropertyBy } = require('../../../../../models/v1/properties/repositories')
const { selectOneBy: selectUnitTypeBy } = require('../../../../../models/v1/unit-types/repositories')
const { STATUSES } = require('../../../../../models/v1/bookings/constants')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const results = await selectOneBy({ accountId, id })
    .whereIn('status', [STATUSES.DRAFT, STATUSES.TENTATIVE])

  if (!results) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deleteBy({ id })

  const property = await selectPropertyBy({ id: results.propertyId })
  const unitType = await selectUnitTypeBy({ id: results.propertyUnitTypeId })

  if (property.channexId && unitType.channexId) {
    // Availability: 1 is because 1 unit type can be booked at once.
    await updateAvailability([{
      propertyId: property.channexId,
      propertyUnitTypeId: unitType.channexId,
      dateFrom: dayjs.utc(results.dateArrival).format('YYYY-MM-DD'),
      dateTo: dayjs.utc(results.dateDeparture).format('YYYY-MM-DD'),
      availability: 1,
    }])
  }

  cache.del([`accounts.${accountId}.bookings.*`])

  return res.sendStatus(204)
})
