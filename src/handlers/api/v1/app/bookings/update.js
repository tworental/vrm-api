const cache = require('../../../../../services/cacheManager')
const dayjs = require('../../../../../services/dayjs')
const createError = require('../../../../../services/errors')
const { updateAvailability } = require('../../../../../services/channex')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { createTransaction, raw } = require('../../../../../services/database')
const { validate } = require('../../../../../services/validate')
const { selectOneBy: selectPropertyBy } = require('../../../../../models/v1/properties/repositories')
const { selectOneBy: selectUnitTypeBy } = require('../../../../../models/v1/unit-types/repositories')
const { selectOneBy: selectUnitBy } = require('../../../../../models/v1/units/repositories')
const {
  tableName: RATES_TABLE_NAME,
  isSelfServiceAllowed,
  isMinStayDaysAllowed,
  calculateNightlyRates,
  calculateTotalTax,
} = require('../../../../../models/v1/unit-type-rates/repositories')
const {
  tableName: RATE_SEASONS_TABLE_NAME,
} = require('../../../../../models/v1/unit-type-rate-seasons/repositories')
const {
  withUnitTypeRates,
  selectOneBy: selectUnitTypeRatePricesBy,
} = require('../../../../../models/v1/unit-type-rate-prices/repositories')
const {
  withUnitTypeRateSeasons,
  selectBy: selectUnitTypeRateSeasonPricesBy,
} = require('../../../../../models/v1/unit-type-rate-season-prices/repositories')
const {
  updateBy: updateBookingBy,
  selectOneBy: selectBookingBy,
  calculateTotalAmount,
  calculateOccupancy,
  changeBookingStatus,
} = require('../../../../../models/v1/bookings/repositories')
const {
  selectBy: selectBookingExtrasBy,
  sumTotalExtras,
} = require('../../../../../models/v1/booking-extras/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/bookings/schema')
const { STATUSES, CANCELED_BY } = require('../../../../../models/v1/bookings/constants')

module.exports = handler(async ({ body, user: { accountId }, params: { id } }, res) => {
  const currentBooking = await selectBookingBy({ accountId, id })

  /**
   * First of all we must check whether the booking exists.
   */
  if (!currentBooking) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const {
    propertyId = currentBooking.propertyId,
    propertyUnitTypeId = currentBooking.propertyUnitTypeId,
    propertyUnitTypeUnitId = currentBooking.propertyUnitTypeUnitId,
    dateArrival = currentBooking.dateArrival,
    dateDeparture = currentBooking.dateDeparture,

    dateCanceled = currentBooking.dateCanceled,
    dateConfirmed = currentBooking.dateConfirmed,
    optionExpirationDate = currentBooking.optionExpirationDate,

    checkinAt = currentBooking.checkinAt,
    checkoutAt = currentBooking.checkoutAt,

    guestsChildren = currentBooking.guestsChildren,
    guestsAdults = currentBooking.guestsAdults,
    guestsTeens = currentBooking.guestsTeens,
    guestsInfants = currentBooking.guestsInfants,

    canceledBy = currentBooking.canceledBy,
    channelName = currentBooking.channelName,
    channelCommission = currentBooking.channelCommission,
    amountDiscount = currentBooking.amountDiscount,
    amountAccommodationDue = currentBooking.amountAccommodationDue,
    amountSecureDeposited = currentBooking.amountSecureDeposited,
    promoCode = currentBooking.promoCode,
    source = currentBooking.source,
    notes = currentBooking.notes,

    status = currentBooking.status,
  } = await validate(body, { schema: UPDATE_SCHEMA })

  /**
   * We must fetch Property for a specific account.
   */
  const property = await selectPropertyBy({ id: propertyId, accountId })

  /**
   * We can create new booking only for existing property.
   */
  if (!property) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { propertyId: ['notExists'] },
    })
  }

  /**
   * We must fetch an Unit Type for a specific Property
   */

  const unitType = await selectUnitTypeBy({ id: propertyUnitTypeId })

  /**
   * We must fetch an Unit for a specific Property & UnitType
   */
  const unit = await selectUnitBy({
    id: propertyUnitTypeUnitId,
    propertyId,
    propertyUnitTypeId,
  })

  /**
   * We can create new booking only for existing unit.
   */
  if (!unit) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { propertyUnitTypeUnitId: ['notExists'] },
    })
  }

  if (!property.isCompleted || !unit.isCompleted) {
    throw createError(422, MESSAGES.NOT_COMPLETED, { code: CODES.NOT_COMPLETED })
  }

  if (!unit.isActive) {
    throw createError(422, MESSAGES.NOT_ACTIVE, { code: CODES.NOT_ACTIVE })
  }

  const arrivalDate = dayjs.utc(dateArrival).format('YYYY-MM-DD HH:mm:ss')
  const departureDate = dayjs.utc(dateDeparture).format('YYYY-MM-DD HH:mm:ss')

  /**
   * We must check whether booking for a specific Unit between provided dates exists or not.
   */
  const booking = await selectBookingBy({
    accountId,
    propertyId,
    propertyUnitTypeId,
    propertyUnitTypeUnitId,
  }).where('id', '!=', id)
    .whereIn('status', [STATUSES.DRAFT, STATUSES.TENTATIVE, STATUSES.CONFIRMED])
    .andWhere((builder) => (
      builder
        .whereBetween('date_arrival', [arrivalDate, departureDate])
        .orWhereBetween('date_departure', [arrivalDate, departureDate])
        .orWhere(raw('? BETWEEN date_arrival AND date_departure', arrivalDate))
        .orWhere(raw('? BETWEEN date_arrival AND date_departure', departureDate))
    ))

  /**
   * If the booking exists then we can not create another booking for provided dates for that Unit.
   */
  if (booking) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: {
        dateArrival: ['exists'],
        dateDeparture: ['exists'],
      },
    })
  }

  /**
   * Calculate maximum number of guests which can stay in property.
   */
  const occupancy = calculateOccupancy({
    guestsChildren,
    guestsAdults,
    guestsTeens,
    guestsInfants,
  })

  /**
   * Get a default rate - UnitTypesRates + Price for specific amount of guests.
   */
  const unitTypeRateDefault = await withUnitTypeRates(
    selectUnitTypeRatePricesBy({ occupancy, propertyId, propertyUnitTypeId })
      .where(`${RATES_TABLE_NAME}.account_id`, accountId)
      .where(`${RATES_TABLE_NAME}.property_id`, propertyId),
  )

  /**
   * Get a Season Rate - UnitTypesSeasonRates + Price for specific amount of guests.
   * Should match to the provided staying dates.
   */
  const unitTypeRateSeasons = await withUnitTypeRateSeasons(
    selectUnitTypeRateSeasonPricesBy({ occupancy, propertyId })
      .where(`${RATE_SEASONS_TABLE_NAME}.property_unit_type_id`, propertyUnitTypeId)
      .where(`${RATE_SEASONS_TABLE_NAME}.account_id`, accountId)
      .where(`${RATE_SEASONS_TABLE_NAME}.is_completed`, 1)
      .where(`${RATES_TABLE_NAME}.property_id`, propertyId)
      .andWhere((builder) => (
        builder
          .whereBetween(`${RATE_SEASONS_TABLE_NAME}.start_date`, [arrivalDate, departureDate])
          .orWhereBetween(`${RATE_SEASONS_TABLE_NAME}.end_date`, [arrivalDate, departureDate])
          .orWhere(raw(
            `? BETWEEN ${RATE_SEASONS_TABLE_NAME}.start_date
              AND ${RATE_SEASONS_TABLE_NAME}.end_date`, arrivalDate,
          ))
          .orWhere(raw(
            `? BETWEEN ${RATE_SEASONS_TABLE_NAME}.start_date
              AND ${RATE_SEASONS_TABLE_NAME}.end_date`, departureDate,
          ))
      )),
  )

  /**
   * Calculate total requested days for staying.
   * We're adding 1 day because we wanna calculate total days including first day and last day.
   *
   * IMPORTANT: We must use date arrival & departure from request (not after dayjs transformation).
   */
  const totalNights = dayjs(dateDeparture).add(1, 'day')
    .diff(dateArrival, 'day')

  /**
   * Build an array with all dates between arrivalDate & departureDate.
   */
  const datesRange = [...Array(totalNights).keys()].map(
    (i) => dayjs.utc(arrivalDate).add(i, 'day').format('YYYY-MM-DD'),
  )

  const nightlyRates = calculateNightlyRates(
    datesRange, unitTypeRateDefault, unitTypeRateSeasons,
  )

  /**
   * We must check whether all days in a range have price.
   * If not then we can't book this unit between those dates.
   */
  if (Object.values(nightlyRates).every((price) => price === null)) {
    throw createError(422, MESSAGES.NOT_AVAILABLE, { code: CODES.NOT_AVAILABLE })
  }

  const selfServiceAllowed = isSelfServiceAllowed(
    arrivalDate, departureDate, unitTypeRateDefault, unitTypeRateSeasons,
  )

  const minStayDaysAllowed = isMinStayDaysAllowed(
    totalNights, arrivalDate, unitTypeRateDefault, unitTypeRateSeasons,
  )

  if (!minStayDaysAllowed) {
    throw createError(422, MESSAGES.BOOKINGS_MIN_STAY, {
      code: CODES.BOOKINGS_MIN_STAY,
    })
  }

  /**
   * We can allow to book the Unit only if selfService & minStayDays are allowed
   */
  if (!selfServiceAllowed) {
    throw createError(422, MESSAGES.NOT_AVAILABLE, { code: CODES.NOT_AVAILABLE })
  }

  let unitTypeTaxRate = 0

  if (unitTypeRateDefault.taxEnabled) {
    unitTypeTaxRate = unitTypeRateDefault.taxPercentage
  }

  const extras = await selectBookingExtrasBy({ bookingId: id })

  const totalExtras = sumTotalExtras(extras)

  const { tax: amountTotalTax, totalAmount } = calculateTotalTax(amountAccommodationDue, unitTypeRateDefault)

  /**
   * Calculate Total Amount of the booking based on payload data
   */
  const amountTotal = calculateTotalAmount({
    amountAccommodationDue: totalAmount,
    amountDiscount,
    amountTotalTax,
    totalExtras,
  })

  const extra = {}

  /**
   * We are reacting on changing status of the booking
   */
  if (status) {
    switch (status) {
      case STATUSES.CANCELED:
        extra.dateCanceled = dateCanceled || new Date(Date.now())
        extra.canceledBy = canceledBy || CANCELED_BY.USER
        extra.dateConfirmed = null
        break

      case STATUSES.CONFIRMED:
        extra.dateConfirmed = dateConfirmed || new Date(Date.now())
        extra.dateCanceled = null
        break

      default:
        extra.dateConfirmed = null
        extra.dateCanceled = null
        extra.canceledBy = null
    }
  }

  const payload = {
    status,
    propertyId,
    propertyUnitTypeId,
    propertyUnitTypeUnitId,
    dateArrival: arrivalDate,
    dateDeparture: departureDate,
    dateCanceled,
    dateConfirmed,
    optionExpirationDate,
    checkinAt,
    checkoutAt,
    guestsChildren,
    guestsAdults,
    guestsTeens,
    guestsInfants,
    amountTotal,
    canceledBy,
    channelName,
    channelCommission,
    unitTypeTaxRate,
    unitTypeTaxIncluded: unitTypeRateDefault.taxIncluded,
    amountDiscount,
    amountAccommodationDue: totalAmount,
    amountSecureDeposited,
    amountTotalTax,
    promoCode,
    source,
    notes,
    ...extra,
  }

  await createTransaction(async (trx) => {
    await updateBookingBy({ id }, payload, trx)

    await changeBookingStatus({
      ...payload,
      accountId,
      id,
      amountTotalPaid: currentBooking.amountTotalPaid,
      currency: currentBooking.currency,
    }, trx)
  })

  if (property.channexId && unitType.channexId) {
    if ([STATUSES.CANCELED, STATUSES.DECLINED].includes(status)) {
      // Availability: 1 is because 1 unit type can be booked at once.
      await updateAvailability([{
        propertyId: property.channexId,
        propertyUnitTypeId: unitType.channexId,
        dateFrom: dayjs.utc(dateArrival).format('YYYY-MM-DD'),
        dateTo: dayjs.utc(dateDeparture).format('YYYY-MM-DD'),
        availability: 1,
      }])
    }

    if ([STATUSES.CONFIRMED].includes(status)) {
      await updateAvailability([{
        propertyId: property.channexId,
        propertyUnitTypeId: unitType.channexId,
        dateFrom: dayjs.utc(dateArrival).format('YYYY-MM-DD'),
        dateTo: dayjs.utc(dateDeparture).format('YYYY-MM-DD'),
        availability: 0,
      }])
    }
  }

  cache.del(`accounts.${accountId}.bookings.*`)

  return res.sendStatus(200)
})
