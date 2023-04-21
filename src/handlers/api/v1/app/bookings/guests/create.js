const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { createTransaction } = require('../../../../../../services/database')
const { validate } = require('../../../../../../services/validate')
const {
  selectOneBy: selectGuestBy,
} = require('../../../../../../models/v1/guests/repositories')
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
  create: createBookingGuest,
  selectOneBy: selectBookingGuestBy,
} = require('../../../../../../models/v1/booking-guests/repositories')
const { VAT_TYPES } = require('../../../../../../models/v1/booking-guests/constants')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/booking-guests/schema')
const { calculateTotalTax } = require('../../../../../../models/v1/unit-type-rates/repositories')

module.exports = handler(async ({ body, params: { bookingId }, user: { accountId } }, res) => {
  const { guestId, notes, vatType = VAT_TYPES.LOCAL_VAT } = await validate(body, { schema: CREATE_SCHEMA })

  const booking = await selectBookingBy({ accountId, id: bookingId })

  if (!booking) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await selectGuestBy({ id: guestId, accountId })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { guestId: ['notExists'] },
    })
  }

  if (await selectBookingGuestBy({ guestId, bookingId })) {
    throw createError(422, 'Only one main guest per booking can exists!')
  }

  const id = await createTransaction(async (trx) => {
    const results = await createBookingGuest({
      guestId, vatType, bookingId, notes,
    }, trx)

    let amountTotalTax = 0
    let { amountAccommodationDue } = booking

    if (vatType === VAT_TYPES.LOCAL_VAT) {
      const { tax, totalAmount } = calculateTotalTax(amountAccommodationDue, {
        taxEnabled: true,
        taxIncluded: booking.unitTypeTaxIncluded,
        taxPercentage: booking.unitTypeTaxRate,
      })
      amountTotalTax = tax
      amountAccommodationDue = totalAmount

      amountTotalTax = booking.amountTotalTax
    }

    const extras = await selectBookingExtrasBy({ bookingId }, trx)

    const totalExtras = sumTotalExtras(extras)

    const amountTotal = calculateTotalAmount({
      amountAccommodationDue,
      amountDiscount: booking.amountDiscount,
      amountTotalTax,
      totalExtras,
    })

    await updateBookingBy({ id: bookingId }, { amountTotalTax, amountTotal }, trx)
    await changeBookingStatus({ ...booking, amountTotalTax, amountTotal }, trx)

    return results
  })

  cache.del([
    `accounts.${accountId}.bookings.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.status(201)
    .json({ data: { id } })
})
