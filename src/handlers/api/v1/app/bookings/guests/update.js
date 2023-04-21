const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { createTransaction } = require('../../../../../../services/database')
const { validate } = require('../../../../../../services/validate')
const { selectOneBy: selectGuestBy } = require('../../../../../../models/v1/guests/repositories')
const {
  selectOneBy: selectBookingBy,
  updateBy: updateBookingBy,
  changeBookingStatus,
  calculateTotalAmount,
} = require('../../../../../../models/v1/bookings/repositories')
const {
  selectBy: selectBookingExtrasBy,
  sumTotalExtras,
} = require('../../../../../../models/v1/booking-extras/repositories')
const {
  selectOneBy: selectBookingGuestBy,
  updateBy: updateBookingGuestsBy,
} = require('../../../../../../models/v1/booking-guests/repositories')
const { VAT_TYPES } = require('../../../../../../models/v1/booking-guests/constants')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/booking-guests/schema')
const { calculateTotalTax } = require('../../../../../../models/v1/unit-type-rates/repositories')

module.exports = handler(async ({ body, params: { id, bookingId }, user: { accountId } }, res) => {
  const booking = await selectBookingBy({ accountId, id: bookingId })

  if (!booking) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const bookingGuest = await selectBookingGuestBy({ id, bookingId })

  if (!bookingGuest) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  if (payload.guestId) {
    if (!await selectGuestBy({ id: payload.guestId, accountId })) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { guestId: ['notExists'] },
      })
    }
  }

  await createTransaction(async (trx) => {
    await updateBookingGuestsBy({ id }, payload, trx)

    let extra = {}

    if (payload.vatType) {
      let amountTotalTax = 0
      let { amountAccommodationDue } = booking

      if (payload.vatType === VAT_TYPES.LOCAL_VAT) {
        const { tax, totalAmount } = calculateTotalTax(amountAccommodationDue, {
          taxEnabled: true,
          taxIncluded: booking.unitTypeTaxIncluded,
          taxPercentage: booking.unitTypeTaxRate,
        })
        amountTotalTax = tax
        amountAccommodationDue = totalAmount
      }

      const extras = await selectBookingExtrasBy({ bookingId }, trx)

      const totalExtras = sumTotalExtras(extras)

      const amountTotal = calculateTotalAmount({
        amountAccommodationDue,
        amountDiscount: booking.amountDiscount,
        amountTotalTax,
        totalExtras,
      })

      extra = { amountTotalTax, amountAccommodationDue, amountTotal }

      await updateBookingBy({ id: bookingId }, extra, trx)
    }

    await changeBookingStatus({ ...booking, ...extra }, trx)
  })

  cache.del([
    `accounts.${accountId}.bookings.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(200)
})
