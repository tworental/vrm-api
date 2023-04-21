const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectBookingBy,
  updateBy: updateBookingBy,
  changeBookingStatus,
} = require('../../../../../../models/v1/bookings/repositories')
const {
  selectOneBy: selectBookingPaymentBy,
  deleteBy: deleteBookingPaymentBy,
  sum: sumBookingPayment,
} = require('../../../../../../models/v1/booking-payments/repositories')

module.exports = handler(async ({ user: { accountId }, params: { bookingId, id } }, res) => {
  const booking = await selectBookingBy({ accountId, id: bookingId })

  if (!booking) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const results = await selectBookingPaymentBy({ id, bookingId })

  if (!results) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await createTransaction(async (trx) => {
    await deleteBookingPaymentBy({ id }, trx)

    const { sum: amountTotalPaid } = await sumBookingPayment('amount_exchanged', { bookingId }, trx)

    await updateBookingBy({ id: bookingId }, { amountTotalPaid }, trx)
    await changeBookingStatus({ ...booking, amountTotalPaid }, trx)
  })

  cache.del([
    `accounts.${accountId}.bookings.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
