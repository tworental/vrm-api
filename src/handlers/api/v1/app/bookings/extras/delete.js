const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectBy: selectBookingExtrasBy,
  selectOneById: selectBookingExtrasById,
  deleteById: deleteBookingExtrasById,
  sumTotalExtras,
} = require('../../../../../../models/v1/booking-extras/repositories')
const {
  selectOneBy: selectBookingBy,
  updateBy: updateBookingBy,
  calculateTotalAmount,
  changeBookingStatus,
} = require('../../../../../../models/v1/bookings/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id, bookingId } }, res) => {
  const booking = await selectBookingBy({ accountId, id: bookingId })

  if (!booking) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const bookingExtras = await selectBookingExtrasById(id, { bookingId })

  if (!bookingExtras) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await createTransaction(async (trx) => {
    await deleteBookingExtrasById(id, { bookingId }, trx)

    const extras = await selectBookingExtrasBy({ bookingId }, trx)

    const amountTotal = calculateTotalAmount({
      amountAccommodationDue: booking.amountAccommodationDue,
      amountDiscount: booking.amountDiscount,
      amountTotalTax: booking.amountTotalTax,
      totalExtras: sumTotalExtras(extras),
    })

    await updateBookingBy({ id: bookingId }, { amountTotal }, trx)
    await changeBookingStatus({ ...booking, amountTotal }, trx)
  })

  cache.del([
    `accounts.${accountId}.bookings.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
