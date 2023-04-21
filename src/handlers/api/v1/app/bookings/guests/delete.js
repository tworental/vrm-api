const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectBookingBy,
  changeBookingStatus,
} = require('../../../../../../models/v1/bookings/repositories')
const {
  selectOneBy: selectBookingGuestBy,
  deleteBy: deleteBookingGuestBy,
} = require('../../../../../../models/v1/booking-guests/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id, bookingId } }, res) => {
  const booking = await selectBookingBy({ accountId, id: bookingId })

  if (!booking) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await selectBookingGuestBy({ id, bookingId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await createTransaction(async (trx) => {
    await deleteBookingGuestBy({ id, bookingId })
    await changeBookingStatus(booking, trx)
  })

  cache.del([
    `accounts.${accountId}.bookings.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
