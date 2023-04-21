const cache = require('../../../../../services/cacheManager')
const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { raw } = require('../../../../../services/database')
const { validate } = require('../../../../../services/validate')
const dayjs = require('../../../../../services/dayjs')
const {
  selectOneBy: selectCurrencyRateBy,
} = require('../../../../../models/v1/dict-currency-rates/repositories')
const {
  selectOneBy: selectPropertyBy,
} = require('../../../../../models/v1/properties/repositories')
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
  selectBy: selectUnitTypeRatePricesBy,
} = require('../../../../../models/v1/unit-type-rate-prices/repositories')
const {
  withUnitTypeRateSeasons,
  selectBy: selectUnitTypeRateSeasonPricesBy,
} = require('../../../../../models/v1/unit-type-rate-season-prices/repositories')
const {
  tableName: UNITS_TABLE_NAME,
  withUnitType,
  selectBy: selectUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const {
  selectBy: selectBookingsBy,
} = require('../../../../../models/v1/bookings/repositories')
const {
  sumTotalExtras,
  calculateExtras,
} = require('../../../../../models/v1/booking-extras/repositories')
const {
  selectBy: selectBookingServicesBy,
} = require('../../../../../models/v1/booking-services/repositories')
const { STATUSES } = require('../../../../../models/v1/bookings/constants')
const { AVAILABILITY_SCHEMA } = require('../../../../../models/v1/bookings/schema')

module.exports = handler(async ({ query, user: { accountId } }, res) => {
  const {
    dateArrival,
    dateDeparture,
    guests,
    bookingId,
    propertyId,
    propertyUnitTypeId,
    propertyUnitTypeUnitId,
  } = await validate(query, { schema: AVAILABILITY_SCHEMA })

  /**
   * We can check availability only for existing property.
   */
  const property = await cache.wrap(
    cache.key(cache.KEY_DEFS.PROPERTY_DETAILS, accountId, propertyId),
    () => (
      selectPropertyBy({ id: propertyId, accountId })
    ),
  )

  /**
   * We can check availability only when property exists.
   */
  if (!property) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { propertyId: ['notExists'] },
    })
  }

  /**
   * We must fetch all Units for a specific Property and UnitType if provided.
   */
  const units = await cache.wrap(
    cache.key(cache.KEY_DEFS.UNITS_LIST, accountId, propertyId, propertyUnitTypeId),
    () => (
      withUnitType(
        selectUnitsBy({ propertyUnitTypeId })
          .where(`${UNITS_TABLE_NAME}.property_id`, propertyId),
      )
    ),
  )

  /**
   * If we provided unitId then we must be sure that Unit exists.
   */
  if (propertyUnitTypeUnitId) {
    if (!units.find(({ id }) => propertyUnitTypeUnitId === id)) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { propertyUnitTypeUnitId: ['notExists'] },
      })
    }
  }

  const arrivalDate = dayjs.utc(dateArrival)
    .format(`YYYY-MM-DD ${property.checkinTime}:00`)

  const departureDate = dayjs.utc(dateDeparture)
    .format(`YYYY-MM-DD ${property.checkoutTime}:00`)

  /**
   * Calculate total requested days (nights) for staying.
   *
   * IMPORTANT: We must use date arrival & departure from request (not after dayjs transformation).
   */
  const totalNights = dayjs(dateDeparture)
    .diff(dateArrival, 'day')

  /**
   * Build an array with all dates between arrivalDate & departureDate.
   */
  const datesRange = [...Array(totalNights).keys()].map(
    (i) => dayjs.utc(arrivalDate).add(i, 'day').format('YYYY-MM-DD'),
  )

  /**
   * Get a default rate - UnitTypesRates + Price for specific amount of guests.
   */
  const unitTypesRateDefaults = await cache.wrap(
    cache.key(cache.KEY_DEFS.UNIT_TYPE_RATES_LIST, accountId, propertyId, { guests }),
    () => (
      withUnitTypeRates(
        selectUnitTypeRatePricesBy({ occupancy: guests })
          .where(`${RATES_TABLE_NAME}.account_id`, accountId)
          .where(`${RATES_TABLE_NAME}.property_id`, propertyId),
      )
    ),
  )

  /**
   * Get a Season Rate - UnitTypesSeasonRates + Price for specific amount of guests.
   * Should match to the provided staying dates.
   */
  const unitTypesRateSeasons = await withUnitTypeRateSeasons(
    selectUnitTypeRateSeasonPricesBy({ occupancy: guests })
      .where(`${RATE_SEASONS_TABLE_NAME}.account_id`, accountId)
      .where(`${RATES_TABLE_NAME}.property_id`, propertyId)
      .where(`${RATE_SEASONS_TABLE_NAME}.is_completed`, 1)
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
   * Get all property bookings to check whether specific unit is already booked within provided dates or not.
   */
  const bookings = await selectBookingsBy({ accountId, propertyId })
    .whereRaw('!(id <=> ?)', [bookingId])
    .whereIn('status', [STATUSES.DRAFT, STATUSES.TENTATIVE, STATUSES.CONFIRMED])
    .andWhere((builder) => (
      builder
        .whereBetween('date_arrival', [arrivalDate, departureDate])
        .orWhereBetween('date_departure', [arrivalDate, departureDate])
        .orWhere(raw('? BETWEEN date_arrival AND date_departure', arrivalDate))
        .orWhere(raw('? BETWEEN date_arrival AND date_departure', departureDate))
    ))

  const taxes = await withTaxes(
    selectPropertyTaxesBy({ propertyId }),
  ).where('taxes.account_id', '=', accountId)

  const fees = await withFees(
    selectPropertyFeesBy({ propertyId }),
  ).where('fees.account_id', '=', accountId)

  const services = await selectBookingServicesBy({ bookingId })

  const currencyRate = await cache.wrap(
    cache.key(cache.KEY_DEFS.CURRENCY_EXCHANGE_RATES, 'latest'),
    () => (
      selectCurrencyRateBy()
        .orderBy('updated_at', 'desc')
    ),
  )

  const data = units.map((unit) => {
    let availability = null

    /**
     * The Unit which we would like to book must be active & completed.
     */
    if (property.isCompleted && unit.propertyUnitTypeCompleted && unit.isCompleted && unit.isActive) {
      const booking = bookings.find(
        (item) => item.propertyUnitTypeUnitId === unit.id,
      )

      /**
       * If booking of the Unit doesn't exists within provided dates then we can still book that unit.
       */
      if (!booking) {
        const defaultRate = unitTypesRateDefaults.find(
          (item) => item.propertyUnitTypeId === unit.propertyUnitTypeId,
        )

        /**
         * We can book Unit only if the Default Rate for that UnitType exists
         * for specific number of guests.
         */
        if (defaultRate) {
          const seasonRates = unitTypesRateSeasons.filter(
            (item) => item.propertyUnitTypeId === unit.propertyUnitTypeId,
          )

          const nightlyRates = calculateNightlyRates(
            datesRange, defaultRate, seasonRates,
          )

          /**
           * We must check whether all days in a range have price.
           * If not then we can't book this unit between those dates.
           */
          if (Object.values(nightlyRates).every((price) => price !== null)) {
            const selfServiceAllowed = isSelfServiceAllowed(
              arrivalDate, departureDate, defaultRate, seasonRates,
            )

            const minStayDaysAllowed = isMinStayDaysAllowed(
              totalNights, arrivalDate, defaultRate, seasonRates,
            )

            if (!minStayDaysAllowed) {
              throw createError(422, MESSAGES.BOOKINGS_MIN_STAY, {
                code: CODES.BOOKINGS_MIN_STAY,
              })
            }

            /**
             * We can allow to book the Unit only if selfService & minStayDays are allowed
             */
            if (selfServiceAllowed) {
              const totalExtras = calculateExtras(
                nightlyRates,
                currencyRate,
                defaultRate.currency,
                guests,
                totalNights,
              )

              const parsedFees = totalExtras(fees)
              const parsedTaxes = totalExtras(taxes)
              const parsedServices = totalExtras(services)

              const totalFees = sumTotalExtras(parsedFees)
              const totalTaxes = sumTotalExtras(parsedTaxes)
              const totalServices = sumTotalExtras(parsedServices)

              const { tax: taxValue } = calculateTotalTax(
                Object.values(nightlyRates).reduce((a, b) => a + b, 0), defaultRate,
              )

              availability = {
                currency: defaultRate.currency,
                taxEnabled: defaultRate.taxEnabled,
                taxIncluded: defaultRate.taxIncluded,
                taxPercentage: defaultRate.taxPercentage,
                taxValue,
                nightlyRates,
                totalFees,
                totalTaxes,
                totalServices,
              }
            }
          }
        }
      }
    }

    return {
      id: unit.id,
      name: unit.name,
      unitTypeId: unit.propertyUnitTypeId,
      unitTypeName: unit.propertyUnitTypeName,
      unitTypeCompleted: unit.propertyUnitTypeCompleted,
      propertyId: unit.propertyId,
      propertyName: property.name,
      propertyCompleted: property.isCompleted,
      checkinTime: property.checkinTime,
      checkoutTime: property.checkoutTime,
      availability,
    }
  })

  return res.json({ data })
})
