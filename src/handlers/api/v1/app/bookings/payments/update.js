const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const { amountByCurrency } = require('../../../../../../models/v1/dict-currency-rates/repositories')
const {
  selectOneBy: selectBookingBy,
  changeBookingStatus,
} = require('../../../../../../models/v1/bookings/repositories')
const {
  selectOneBy: selectBookingPaymentBy,
  updateBy: updateBookingPaymentBy,
} = require('../../../../../../models/v1/booking-payments/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/booking-payments/schema')

module.exports = handler(async ({ user: { accountId }, params: { id, bookingId }, body }, res) => {
  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  const booking = await selectBookingBy({ accountId, id: bookingId })

  if (!booking) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { bookingId: ['notExists'] },
    })
  }

  const bookingPayment = await selectBookingPaymentBy({ id, bookingId })

  if (!bookingPayment) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  payload.amount = payload.amount || bookingPayment.amount
  payload.currency = payload.currency || bookingPayment.currency

  if (!payload.currencyRate) {
    payload.currencyRate = bookingPayment.currencyRate || 1

    if (payload.currency !== booking.currency) {
      const currencyRate = await amountByCurrency(booking.currency)

      payload.currencyRate = currencyRate(payload.amount, payload.currency)
    }
  }

  payload.amountExchanged = payload.amount * payload.currencyRate

  await createTransaction(async (trx) => {
    await updateBookingPaymentBy({ id }, payload)
    await changeBookingStatus(booking, trx)
  })

  cache.del([
    `accounts.${accountId}.bookings.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(200)
})
