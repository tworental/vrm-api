const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectBookingBy } = require('../../../../../../models/v1/bookings/repositories')
const { selectBy: selectBookingGuestsBy } = require('../../../../../../models/v1/booking-guests/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/booking-guests/serializers')

module.exports = handler(async ({ user: { accountId }, params: { bookingId } }, res) => {
  if (!await selectBookingBy({ accountId, id: bookingId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const results = await selectBookingGuestsBy({ bookingId })

  return res.json({
    data: serialize(PERMITED_COLLECTION_PARAMS, results),
  })
})
