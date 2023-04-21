const { TYPES } = require('./constants')
const {
  create: createBookingFee,
  selectBy: selectBookingFeesBy,
  selectOneBy: selectBookingFeeBy,
  updateBy: updateBookingFeeBy,
  deleteBy: deleteBookingFeeBy,
} = require('../booking-fees/repositories')
const {
  create: createBookingTax,
  selectBy: selectBookingTaxesBy,
  selectOneBy: selectBookingTaxBy,
  updateBy: updateBookingTaxBy,
  deleteBy: deleteBookingTaxBy,
} = require('../booking-taxes/repositories')
const {
  create: createBookingService,
  selectBy: selectBookingServicesBy,
  selectOneBy: selectBookingServiceBy,
  updateBy: updateBookingServiceBy,
  deleteBy: deleteBookingServiceBy,
} = require('../booking-services/repositories')
const { onlyKeys } = require('../../../services/utility')
const { RATE_TYPES, CHARGE_TYPE, FREQUENCIES } = require('../taxes/constants')

const SERVICES_FIELDS_ALLOWED = [
  'bookingId',
  'propertyServiceId',
  'name',
  'quantity',
  'duration',
  'type',
  'chargeType',
  'currency',
  'amount',
  'totalAmount',
  'totalAmountExchanged',
  'taxIncluded',
  'taxValue',
  'startDate',
  'startTime',
  'reminders',
  'providerName',
  'providerEmail',
  'providerPhoneNumber',
  'providerCompanyName',
  'providerCompanyAddress',
  'providerContactPerson',
  'providerDescription',
  'providerNotes',
  'description',
]

const FEES_FIELDS_ALLOWED = [
  'bookingId',
  'dictFeeId',
  'name',
  'rateType',
  'percentage',
  'currency',
  'amount',
  'chargeType',
  'frequency',
  'taxIncluded',
  'taxValue',
  'totalAmount',
  'totalAmountExchanged',
  'description',
]

const TAXES_FIELDS_ALLOWED = [
  'bookingId',
  'name',
  'rateType',
  'percentage',
  'currency',
  'amount',
  'chargeType',
  'frequency',
  'totalAmount',
  'totalAmountExchanged',
  'description',
]

/**
 *  1. flat fee & single charge per stay then we add this amount to the booking.
 *  2. flat fee & single charge per night then we add this amount multipled per night to the booking.
 *  3. flat fee per person - per stay then we add this amount to the booking multipled per person.
 *  4. flat fee per person - per night then we add this amount to the booking multipled per person and per night.
 *    - VAT INCL. 10% then nothing changes on the end
 *    - VAT excluded. 10% then we must add to total amount of the calculated fee.
 *
 *  PERCENTAGE:
 *    - just add percentage to the booking
 */
const calculateExtras = (
  nightlyRates,
  currencyExchangeRates,
  currency,
  guests,
  totalNights,
) => (extras) => {
  const exchangeRatesDict = currencyExchangeRates && currencyExchangeRates.rates
    ? currencyExchangeRates.rates
    : {}

  const currencyRates = Object.fromEntries(
    Object.entries(exchangeRatesDict).map(
      ([key, value]) => [key.toUpperCase(), value],
    ),
  )

  const totalRate = Object.values(nightlyRates)
    .reduce((acc, curr) => acc + curr, 0)

  return extras.map((item) => {
    const {
      amount = 0,
      quantity = 1,
      taxIncluded = 1,
      taxValue = 0,
    } = item

    let currencyRate = 1
    let totalAmount = 0
    let totalAmountExchanged = 0

    if (item.currency && item.currency !== currency) {
      currencyRate = (currencyRates[currency] || currencyRate) / currencyRates[item.currency]
    }

    if (item.rateType === RATE_TYPES.PERCENTAGE) {
      totalAmount = totalRate * (item.percentage / 100)
    } else {
      /**
       * If the frequency attribute exists then we always use:
       *  - chargeType [singleCharge, perPerson]
       *  - frequency [perStay, perNight]
       *
       * Otherwise we use only:
       *  - chargeType [singleCharge, perNight]
       */
      totalAmount = amount

      if (item.chargeType !== CHARGE_TYPE.SINGLE_CHARGE) {
        totalAmount = amount * totalNights
      }

      if (Object.prototype.hasOwnProperty.call(item, 'frequency')) {
        switch (item.chargeType) {
          case CHARGE_TYPE.SINGLE_CHARGE:
            if (item.frequency === FREQUENCIES.PER_NIGHT) {
              totalAmount = amount * totalNights
            } else {
              totalAmount = amount
            }
            break

          default:
            if (item.frequency === FREQUENCIES.PER_NIGHT) {
              totalAmount = amount * totalNights * guests
            } else {
              totalAmount = amount * guests
            }
            break
        }
      }
    }

    if (!taxIncluded && taxValue > 0) {
      totalAmount += (totalAmount * (taxValue / 100))
    }

    totalAmountExchanged = totalAmount * currencyRate

    return {
      ...item,
      amount,
      currency,
      currencyRate,
      quantity,
      totalAmount,
      totalAmountExchanged,
    }
  })
}

const sumTotalExtras = (extras) => (extras || [])
  .reduce((acc, curr) => acc + curr.totalAmountExchanged, 0)

const selectBy = async (conditions, trx) => {
  const fees = await selectBookingFeesBy(conditions, trx)
  const taxes = await selectBookingTaxesBy(conditions, trx)
  const services = await selectBookingServicesBy(conditions, trx)

  return Object.entries({ fees, taxes, services }).flatMap(([key, items]) => (
    items.map((item) => ({
      ...item,
      id: `${TYPES[key]}-${item.id}`,
      extrasType: TYPES[key],
    }))
  ))
}

const selectOneById = (extrasId, conditions, trx) => {
  const [type, id] = extrasId.split('-')

  switch (type) {
    case TYPES.fees:
      return selectBookingFeeBy({ id, ...conditions }, trx)
        .then((item) => ({ ...item, id: `${TYPES.fees}-${item.id}` }))

    case TYPES.taxes:
      return selectBookingTaxBy({ id, ...conditions }, trx)
        .then((item) => ({ ...item, id: `${TYPES.taxes}-${item.id}` }))

    case TYPES.services:
      return selectBookingServiceBy({ id, ...conditions }, trx)
        .then((item) => ({ ...item, id: `${TYPES.services}-${item.id}` }))

    default:
      return null
  }
}

const create = (type, payload, trx) => {
  switch (type) {
    case TYPES.fees:
      return createBookingFee(
        onlyKeys(payload, FEES_FIELDS_ALLOWED), trx,
      )

    case TYPES.taxes:
      return createBookingTax(
        onlyKeys(payload, TAXES_FIELDS_ALLOWED), trx,
      )

    case TYPES.services:
      return createBookingService(
        onlyKeys(payload, SERVICES_FIELDS_ALLOWED), trx,
      )

    default:
      return null
  }
}

const updateById = (extrasId, conditions, payload, trx) => {
  const [type, id] = extrasId.split('-')

  switch (type) {
    case TYPES.fees:
      return updateBookingFeeBy(
        { id, ...conditions },
        onlyKeys(payload, FEES_FIELDS_ALLOWED),
        trx,
      )

    case TYPES.taxes:
      return updateBookingTaxBy(
        { id, ...conditions },
        onlyKeys(payload, TAXES_FIELDS_ALLOWED),
        trx,
      )

    case TYPES.services:
      return updateBookingServiceBy(
        { id, ...conditions },
        onlyKeys(payload, SERVICES_FIELDS_ALLOWED),
        trx,
      )

    default:
      return null
  }
}

const deleteById = (extrasId, conditions, trx) => {
  const [type, id] = extrasId.split('-')

  switch (type) {
    case TYPES.fees:
      return deleteBookingFeeBy({ id, ...conditions }, trx)

    case TYPES.taxes:
      return deleteBookingTaxBy({ id, ...conditions }, trx)

    case TYPES.services:
      return deleteBookingServiceBy({ id, ...conditions }, trx)

    default:
      return null
  }
}

module.exports = {
  create,
  selectBy,
  selectOneById,
  updateById,
  deleteById,
  calculateExtras,
  sumTotalExtras,
}
