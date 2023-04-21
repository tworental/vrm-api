const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectBookingBy } = require('../../../../../../models/v1/bookings/repositories')
const { selectOneBy: selectBookingPaymentBy } = require('../../../../../../models/v1/booking-payments/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/booking-payments/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id, bookingId } }, res) => {
  if (!await selectBookingBy({ accountId, id: bookingId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await selectBookingPaymentBy({ id, bookingId })
    .then((results) => serialize(PERMITED_ITEM_PARAMS, results))

  if (!data) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  return res.json({ data })
})
