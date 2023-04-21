const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectBookingBy } = require('../../../../../../models/v1/bookings/repositories')
const { selectOneById: selectBookingExtrasById } = require('../../../../../../models/v1/booking-extras/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id, bookingId } }, res) => {
  if (!await selectBookingBy({ accountId, id: bookingId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await selectBookingExtrasById(id, { bookingId })

  if (!data) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  return res.json({ data })
})
