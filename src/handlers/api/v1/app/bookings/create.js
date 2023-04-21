const cache = require('../../../../../services/cacheManager')
const dayjs = require('../../../../../services/dayjs')
const createError = require('../../../../../services/errors')
const { updateAvailability } = require('../../../../../services/channex')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { raw, createTransaction } = require('../../../../../services/database')
const { validate } = require('../../../../../services/validate')
const { selectOneBy: selectCurrencyRateBy } = require('../../../../../models/v1/dict-currency-rates/repositories')
const { selectOneBy: selectPropertyBy } = require('../../../../../models/v1/properties/repositories')
const { selectOneBy: selectUnitTypeBy } = require('../../../../../models/v1/unit-types/repositories')
const { selectOneBy: selectUnitBy } = require('../../../../../models/v1/units/repositories')
const {
  withTaxes,
  selectBy: selectPropertyTaxesBy,
} = require('../../../../../models/v1/property-taxes/repositories')
const {
  withFees,
  selectBy: selectPropertyFeesBy,
} = require('../../../../../models/v1/property-fees/repositories')
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
  create: createBooking,
  selectOneBy: selectBookingBy,
  calculateTotalAmount,
  calculateOccupancy,
} = require('../../../../../models/v1/bookings/repositories')
const {
  sumTotalExtras,
  calculateExtras,
} = require('../../../../../models/v1/booking-extras/repositories')
const { create: createBookingExtras } = require('../../../../../models/v1/booking-extras/repositories')
const { STATUSES } = require('../../../../../models/v1/bookings/constants')
const { TYPES } = require('../../../../../models/v1/booking-extras/constants')
const { CREATE_SCHEMA } = require('../../../../../models/v1/bookings/schema')

module.exports = handler(async ({ body, user: { accountId } }, res) => {
  const {
    propertyId,
    propertyUnitTypeId,
    propertyUnitTypeUnitId,
    dateArrival,
    dateDeparture,

    dateCanceled,
    dateConfirmed,
    optionExpirationDate,

    checkinAt,
    checkoutAt,

    guestsChildren,
    guestsAdults,
    guestsTeens,
    guestsInfants,

    canceledBy,
    channelName,
    channelCommission,
    amountDiscount,
    amountAccommodationDue,
    amountSecureDeposited,
    promoCode,
    source,
    notes,
  } = await validate(body, { schema: CREATE_SCHEMA })

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

  const unitType = await selectUnitTypeBy({
    id: propertyUnitTypeId,
  })

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

  const arrivalDate = dayjs.utc(dateArrival)
    .format('YYYY-MM-DD HH:mm:ss')

  const departureDate = dayjs.utc(dateDeparture)
    .format('YYYY-MM-DD HH:mm:ss')

  /**
   * We must check whether booking for a specific Unit between provided dates exists or not.
   */
  const booking = await selectBookingBy({
    accountId,
    propertyId,
    propertyUnitTypeId,
    propertyUnitTypeUnitId,
  }).whereIn('status', [STATUSES.DRAFT, STATUSES.TENTATIVE, STATUSES.CONFIRMED])
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

  const taxes = await withTaxes(
    selectPropertyTaxesBy({ propertyId }),
  ).where('taxes.account_id', '=', accountId)

  const fees = await withFees(
    selectPropertyFeesBy({ propertyId }),
  ).where('fees.account_id', '=', accountId)

  const currencyRate = await selectCurrencyRateBy()
    .orderBy('updated_at', 'desc')

  const totalExtras = calculateExtras(
    nightlyRates,
    currencyRate,
    unitTypeRateDefault.currency,
    occupancy,
    totalNights,
  )

  let unitTypeTaxRate = 0

  if (unitTypeRateDefault.taxEnabled) {
    unitTypeTaxRate = unitTypeRateDefault.taxPercentage
  }

  const parsedFees = totalExtras(fees)
  const parsedTaxes = totalExtras(taxes)

  const totalFees = sumTotalExtras(parsedFees)
  const totalTaxes = sumTotalExtras(parsedTaxes)

  const { tax: amountTotalTax, totalAmount } = calculateTotalTax(amountAccommodationDue, unitTypeRateDefault)
  /**
   * Calculate Total Amount of the booking based on payload data
   */
  const amountTotal = calculateTotalAmount({
    amountAccommodationDue: totalAmount,
    amountDiscount,
    amountTotalTax,
    totalExtras: (totalFees + totalTaxes),
  })

  /**
   * Create a booking in the database.
   */
  const id = await createTransaction(async (trx) => {
    const bookingId = await createBooking({
      status: STATUSES.DRAFT,
      currency: unitTypeRateDefault.currency,
      accountId,
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
    }, trx)

    await Promise.all(parsedFees.map(
      (item) => createBookingExtras(TYPES.fees, { ...item, bookingId }, trx),
    ))

    await Promise.all(parsedTaxes.map(
      (item) => createBookingExtras(TYPES.taxes, { ...item, bookingId }, trx),
    ))

    return bookingId
  })

  if (property.channexId && unitType.channexId) {
    await updateAvailability([{
      propertyId: property.channexId,
      propertyUnitTypeId: unitType.channexId,
      dateFrom: dayjs.utc(dateArrival).format('YYYY-MM-DD'),
      dateTo: dayjs.utc(dateDeparture).format('YYYY-MM-DD'),
      availability: 0,
    }])
  }

  cache.del(`accounts.${accountId}.bookings.*`)

  return res.status(201).json({ data: { id } })
})
