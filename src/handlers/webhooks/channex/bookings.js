const dayjs = require('../../../services/dayjs')
const { handler } = require('../../../services/http')
const { getBooking } = require('../../../services/channex')
const { createTransaction, raw } = require('../../../services/database')
const { TYPES } = require('../../../models/v1/guests/constants')
const { TABLE_NAME: UNITS_TABLE_NAME } = require('../../../models/v1/units/constants')
const { STATUSES } = require('../../../models/v1/bookings/constants')
const { VAT_TYPES } = require('../../../models/v1/booking-guests/constants')
const { RATE_TYPES } = require('../../../models/v1/taxes/constants')
const { selectOneBy: selectPropertyBy } = require('../../../models/v1/properties/repositories')
const { selectBy: selectUnitTypesBy } = require('../../../models/v1/unit-types/repositories')
const { selectBy: selectUnitsBy } = require('../../../models/v1/units/repositories')
const { create: createBooking, selectBy: selectBookingsBy } = require('../../../models/v1/bookings/repositories')
const { create: createBookingGuest } = require('../../../models/v1/booking-guests/repositories')
const { create: createBookingTax } = require('../../../models/v1/booking-taxes/repositories')
const { getTaxOptionsByChannexPriceMode } = require('../../../models/v1/taxes/repositories')
const { create: createGuest } = require('../../../models/v1/guests/repositories')
const { withUnitType } = require('../../../models/v1/units/repositories')

module.exports = handler(async ({ body }, res) => {
  await createTransaction(async (trx) => {
    const channexBooking = await getBooking({ id: body.payload.booking_id })
    const bookingData = channexBooking.data.attributes

    const property = await selectPropertyBy({ channexId: bookingData.property_id })
    const unitTypes = await selectUnitTypesBy({ propertyId: property.id })
    const units = await withUnitType(
      selectUnitsBy()
        .where(`${UNITS_TABLE_NAME}.property_id`, property.id),
    )

    const arrivalDate = dayjs.utc(`${bookingData.arrival_date} ${bookingData.arrival_hour}`, 'YYYY-MM-DD HH:mm').toISOString()
    const departureDate = dayjs.utc(`${bookingData.departure_date} ${property.checkoutTime}`, 'YYYY-MM-DD HH:mm').toISOString()

    const bookings = await selectBookingsBy({ accountId: property.accountId, propertyId: property.id })
      .whereIn('status', [STATUSES.DRAFT, STATUSES.TENTATIVE, STATUSES.CONFIRMED])
      .andWhere((builder) => (
        builder
          .whereBetween('date_arrival', [arrivalDate, departureDate])
          .orWhereBetween('date_departure', [arrivalDate, departureDate])
          .orWhere(raw('? BETWEEN date_arrival AND date_departure', arrivalDate))
          .orWhere(raw('? BETWEEN date_arrival AND date_departure', departureDate))
      ))

    const getFirstAvailableUnit = (unitTypeId) => (
      units.filter((unit) => unit.propertyUnitTypeId === unitTypeId).find((unit) => {
        if (property.isCompleted && unit.propertyUnitTypeCompleted && unit.isCompleted && unit.isActive) {
          return !bookings.find((item) => item.propertyUnitTypeUnitId === unit.id)
        }

        return false
      })
    )

    await Promise.all(bookingData.rooms.map(async (room) => {
      const unitType = unitTypes.find((item) => item.channexId === room.room_type_id)
      const unit = getFirstAvailableUnit(unitType.id)

      const includedTaxes = room.taxes.filter((tax) => tax.is_inclusive)
      const notIncludedTaxes = room.taxes.filter((tax) => !tax.is_inclusive)

      const includedTaxesAmount = includedTaxes.reduce((acc, curr) => acc + Number(curr.total_price), 0)
      const notIncludedTaxesAmount = notIncludedTaxes.reduce((acc, curr) => acc + Number(curr.total_price), 0)

      const bookingId = await createBooking({
        accountId: property.accountId,
        propertyId: property.id,
        propertyUnitTypeId: unitType.id,
        propertyUnitTypeUnitId: unit.id,
        channexId: bookingData.id,
        channexRevisionId: bookingData.revision_id,
        dateArrival: arrivalDate,
        dateDeparture: departureDate,
        guestsAdults: room.occupancy.adults,
        guestsChildren: room.occupancy.children,
        guestsTeens: 0,
        guestsInfants: room.occupancy.infants,
        status: STATUSES.TENTATIVE,
        channelName: null,
        channelCommission: null,
        unitTypeTaxRate: null,
        unitTypeTaxIncluded: null,
        amountDiscount: 0,
        amountAccommodationDue: Number(room.amount) - includedTaxesAmount - notIncludedTaxesAmount,
        amountSecureDeposited: 0,
        amountTotalPaid: 0,
        amountTotalTax: includedTaxesAmount,
        amountTotal: Number(room.amount),
        currency: bookingData.currency,
        promoCode: null,
        source: null,
        notes: null,
        isPaid: 0,
        otaReservationCode: bookingData.ota_reservation_code,
        otaName: bookingData.ota_name,
      }, trx)

      const guestId = await createGuest({
        accountId: property.accountId,
        type: TYPES.PRIVATE,
        email: bookingData.customer.mail,
        phoneNumber: bookingData.customer.phone,
        firstName: bookingData.customer.name,
        lastName: bookingData.customer.surname,
        country_code: bookingData.customer.country,
        city: bookingData.customer.city,
        address: bookingData.customer.address,
        zip: bookingData.customer.zip,
        parlance: bookingData.customer.language,
      }, trx)

      await createBookingGuest({
        bookingId,
        guestId,
        vatType: VAT_TYPES.LOCAL_VAT,
      }, trx)

      await Promise.all(notIncludedTaxes.map((tax) => {
        const { chargeType, frequency } = getTaxOptionsByChannexPriceMode(tax.price_mode)

        return createBookingTax({
          bookingId,
          name: tax.name,
          rateType: RATE_TYPES.FIXED,
          currency: bookingData.currency,
          currencyRate: 1, // uses the same currency as booking does
          amount: Number(tax.price_per_unit || tax.total_price),
          chargeType,
          frequency,
          totalAmount: Number(tax.total_price),
          totalAmountExchanged: Number(tax.total_price),
        })
      }))
    }))
  })

  return res.sendStatus(200)
})
