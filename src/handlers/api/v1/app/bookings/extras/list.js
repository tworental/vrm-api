const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectBookingBy } = require('../../../../../../models/v1/bookings/repositories')
const { selectBy: selectBookingExtrasBy } = require('../../../../../../models/v1/booking-extras/repositories')

module.exports = handler(async ({ user: { accountId }, params: { bookingId } }, res) => {
  if (!await selectBookingBy({ accountId, id: bookingId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await selectBookingExtrasBy({ bookingId })

  return res.json({ data })
})
