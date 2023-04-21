const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const dayjs = require('../../../../../../services/dayjs')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const { onlyKeys } = require('../../../../../../services/utility')
const {
  selectOneBy: selectPropertyServiceBy,
  withServices,
} = require('../../../../../../models/v1/property-services/repositories')
const {
  selectBy: selectServiceRemindersBy,
} = require('../../../../../../models/v1/service-reminders/repositories')
const {
  selectOneBy: selectServiceProviderBy,
} = require('../../../../../../models/v1/service-providers/repositories')
const {
  selectOneBy: selectCurrencyRateBy,
} = require('../../../../../../models/v1/dict-currency-rates/repositories')
const {
  selectBy: selectBookingExtrasBy,
  selectOneById: selectBookingExtrasById,
  updateById: updateBookingExtrasById,
  calculateExtras,
  sumTotalExtras,
} = require('../../../../../../models/v1/booking-extras/repositories')
const {
  selectOneBy: selectBookingBy,
  updateBy: updateBookingBy,
  calculateOccupancy,
  calculateTotalAmount,
  changeBookingStatus,
} = require('../../../../../../models/v1/bookings/repositories')
const { TYPES } = require('../../../../../../models/v1/booking-extras/constants')
const { updateSchema } = require('../../../../../../models/v1/booking-extras/schema')

module.exports = handler(async ({ body, params: { id, bookingId }, user: { accountId } }, res) => {
  const booking = await selectBookingBy({ accountId, id: bookingId })

  if (!booking) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const { extrasType } = body

  const bookingExtas = await selectBookingExtrasById(id, { bookingId })

  if (!bookingExtas) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const payload = await validate(body, {
    schema: updateSchema(extrasType),
  })

  const currencyRate = await selectCurrencyRateBy()
    .orderBy('updated_at', 'desc')

  const occupancy = calculateOccupancy(booking)

  const nightlyRates = [booking.amountAccommodationDue]

  let data = { totalAmount: 0 }

  /**
   * For services we have different structure
   */
  if (extrasType === TYPES.services) {
    const service = await withServices(
      selectPropertyServiceBy({
        propertyId: booking.propertyId,
      }).where('property_services.id', '=', payload.propertyServiceId),
    )

    const reminders = await selectServiceRemindersBy({ serviceId: service.id }).then(
      (results) => results.map((item) => onlyKeys(item, [
        'time',
        'timeUnit',
        'eventType',
        'reminderSms',
        'reminderEmail',
        'phoneNumber',
        'email',
      ])),
    )

    const extras = calculateExtras(
      nightlyRates,
      currencyRate,
      booking.currency,
      occupancy,
      payload.quantity,
    )([service])

    data = [...extras].shift()

    let serviceProvider = {}

    if (service.serviceProviderId) {
      serviceProvider = await selectServiceProviderBy({
        id: service.serviceProviderId,
        accountId,
      }).then((results) => ({
        providerName: results.name,
        providerEmail: results.email,
        providerPhoneNumber: results.phoneNumber,
        providerCompanyName: results.companyName,
        providerCompanyAddress: results.companyAddress,
        providerContactPerson: results.contactPerson,
        providerDescription: results.description,
        providerNotes: results.notes,
      }))
    }

    data = {
      reminders,
      ...data,
      ...payload,
      ...serviceProvider,
      ...onlyKeys(service, [
        'name',
        'quantity',
        'duration',
        'type',
        'chargeType',
        'currency',
        'amount',
        'taxIncluded',
        'taxValue',
        'description',
      ]),
    }
  } else {
    const totalNights = dayjs(booking.dateDeparture).add(1, 'day')
      .diff(booking.dateArrival, 'day')

    const extras = calculateExtras(
      nightlyRates,
      currencyRate,
      booking.currency,
      occupancy,
      totalNights,
    )([payload])

    data = [...extras].shift()
  }

  await createTransaction(async (trx) => {
    await updateBookingExtrasById(id, { bookingId }, data, trx)

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

  return res.sendStatus(200)
})
