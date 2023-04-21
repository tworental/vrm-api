const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const { amountByCurrency } = require('../../../../../../models/v1/dict-currency-rates/repositories')
const {
  selectOneBy: selectBookingBy,
  updateBy: updateBookingBy,
  changeBookingStatus,
} = require('../../../../../../models/v1/bookings/repositories')
const {
  create: createBookingPayment,
  sum: sumBookingPayment,
} = require('../../../../../../models/v1/booking-payments/repositories')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/booking-payments/schema')

module.exports = handler(async ({ user: { accountId }, params: { bookingId }, body }, res) => {
  const payload = await validate(body, { schema: CREATE_SCHEMA })

  const booking = await selectBookingBy({ accountId, id: bookingId })

  if (!booking) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { bookingId: ['notExists'] },
    })
  }

  if (!payload.currencyRate) {
    payload.currencyRate = 1

    if (payload.currency !== booking.currency) {
      const currencyRate = await amountByCurrency(booking.currency)

      payload.currencyRate = currencyRate(payload.amount, payload.currency)
    }
  }

  payload.amountExchanged = payload.amount * payload.currencyRate

  const id = await createTransaction(async (trx) => {
    const results = await createBookingPayment({ ...payload, bookingId }, trx)

    const { sum: amountTotalPaid } = await sumBookingPayment('amount_exchanged', { bookingId }, trx)

    await updateBookingBy({ id: bookingId }, { amountTotalPaid }, trx)
    await changeBookingStatus({ ...booking, amountTotalPaid }, trx)

    return results
  })

  cache.del([
    `accounts.${accountId}.bookings.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.status(201).json({ data: { id } })
})
