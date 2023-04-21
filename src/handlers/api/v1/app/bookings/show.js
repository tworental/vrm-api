const cache = require('../../../../../services/cacheManager')
const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectBookingGuests } = require('../../../../../models/v1/booking-guests/repositories')
const {
  sumTotalExtras,
  selectBy: selectBookingExtrasBy,
} = require('../../../../../models/v1/booking-extras/repositories')

const { bookingDetails } = require('../../../../../models/v1/bookings/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/bookings/serializers')
const { TYPES } = require('../../../../../models/v1/booking-extras/constants')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const data = await cache.wrap(cache.key(cache.KEY_DEFS.BOOKING_DETAILS, accountId, id), () => (
    bookingDetails({ id, accountId })
  ))

  if (!data) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const guests = await cache.wrap(cache.key(cache.KEY_DEFS.BOOKING_GUESTS, accountId, id), () => (
    selectBookingGuests(id)
  ))

  const extras = await cache.wrap(cache.key(cache.KEY_DEFS.BOOKING_EXTRAS, accountId, id), () => (
    selectBookingExtrasBy({ bookingId: id })
      .then((results) => results.reduce((acc, curr) => {
        acc[curr.extrasType] = acc[curr.extrasType] || []
        acc[curr.extrasType].push(curr)
        return acc
      }, {}))
  ))

  const totalFees = sumTotalExtras(extras[TYPES.fees])
  const totalTaxes = sumTotalExtras(extras[TYPES.taxes])
  const totalServices = sumTotalExtras(extras[TYPES.services])

  return res.json({
    data: serialize(PERMITED_ITEM_PARAMS, data, {
      guest: guests[0], totalFees, totalTaxes, totalServices,
    }),
  })
})
