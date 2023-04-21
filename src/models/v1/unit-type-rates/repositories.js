const dao = require('../../../services/dao')
const dayjs = require('../../../services/dayjs')

const {
  TABLE_NAME,
  DAYS_IN_WEEK,
  DAYS_IN_MONTH,
  DISCOUNT_TYPES,
} = require('./constants')

const getRateByDates = (date, defaultRate, seasonRates) => (
  seasonRates.find(({ startDate, endDate, isCompleted }) => (
    isCompleted && dayjs(date).isBetween(startDate, endDate, null, '[]')
  )) || defaultRate
)

const getRateDatesByRange = (datesRange, defaultRate, seasonRates) => (
  datesRange.reduce((acc, date) => {
    const rate = getRateByDates(date, defaultRate, seasonRates)

    if (rate.startDate && rate.endDate) {
      acc[rate.id] = acc[rate.id] || []
      acc[rate.id].push(date)
    }
    return acc
  }, {})
)

const nightlyPriceByRate = (totalDays, {
  discountEnabled,
  discountType,
  discountCustomEnabled,
  discountCustomPeriod,
  discountCustom,
  discountWeekly,
  discountMonthly,
}) => {
  let nightlyRate

  /**
   * Right now we are supporting only the AMOUNT type of discounts.
   */
  if (discountEnabled && discountType === DISCOUNT_TYPES.AMOUNT) {
    let customDays = 0

    if (discountCustomEnabled && discountCustom > 0) {
      if (totalDays >= discountCustomPeriod) {
        customDays = discountCustomPeriod
      }
    }

    if (totalDays >= DAYS_IN_WEEK && customDays < DAYS_IN_WEEK) {
      nightlyRate = discountWeekly / DAYS_IN_WEEK
    }

    if (totalDays >= DAYS_IN_MONTH && customDays < DAYS_IN_MONTH) {
      nightlyRate = discountMonthly / DAYS_IN_MONTH
    }

    if (customDays > 0 && totalDays >= customDays) {
      nightlyRate = discountCustom / customDays
    }
  }
  return nightlyRate
}

const calculateNightlyRates = (datesRange, defaultRate, seasonRates) => {
  const dates = getRateDatesByRange(datesRange, defaultRate, seasonRates)

  let nightlyPrice = null

  return datesRange.reduce((acc, date) => {
    const rate = getRateByDates(date, defaultRate, seasonRates)

    if (rate.startDate && rate.endDate && Array.isArray(dates[rate.id])) {
      const rateDaysLength = dates[rate.id].length

      if (rateDaysLength) {
        nightlyPrice = nightlyPriceByRate(rateDaysLength, rate)
      }
    }

    const priceWeekday = nightlyPrice || rate[`priceWeekday${dayjs(date).format('dd')}`]

    const amount = priceWeekday !== null ? priceWeekday : rate.priceNightly

    const value = defaultRate.taxEnabled && defaultRate.taxIncluded
      ? (amount / (1 + (defaultRate.taxPercentage / 100)))
      : amount

    return {
      ...acc,
      [date]: value,
    }
  }, {})
}

const isSelfServiceAllowed = (dateArrival, dateDeparture, defaultRate, seasonRates) => {
  const arrivalRate = getRateByDates(dateArrival, defaultRate, seasonRates)
  const departureRate = getRateByDates(dateDeparture, defaultRate, seasonRates)

  let checkinAvailable = true
  let checkoutAvailable = true

  if (arrivalRate.selfServiceRestrictionsEnabled) {
    if (arrivalRate.selfServiceRestrictionsDefault) {
      checkinAvailable = defaultRate[`selfServiceCheckin${dayjs(dateArrival).format('dd')}`]
    } else {
      checkinAvailable = arrivalRate[`selfServiceCheckin${dayjs(dateArrival).format('dd')}`]
    }
  }

  if (departureRate.selfServiceRestrictionsEnabled) {
    if (departureRate.selfServiceRestrictionsDefault) {
      checkoutAvailable = defaultRate[`selfServiceCheckout${dayjs(dateDeparture).format('dd')}`]
    } else {
      checkoutAvailable = departureRate[`selfServiceCheckout${dayjs(dateDeparture).format('dd')}`]
    }
  }

  return Boolean(checkinAvailable && checkoutAvailable)
}

const isMinStayDaysAllowed = (totalDays, dateArrival, defaultRate, seasonRates) => {
  const arrivalRate = getRateByDates(dateArrival, defaultRate, seasonRates)

  let minStayDays = defaultRate.minStayWeekdayEnabled
    ? defaultRate[`minStayWeekday${dayjs(dateArrival).format('dd')}`]
    : defaultRate.minStayDays

  if (!arrivalRate.minStayWeekdayDefault) {
    if (arrivalRate.minStayWeekdayEnabled) {
      minStayDays = arrivalRate[`minStayWeekday${dayjs(dateArrival).format('dd')}`]
    } else {
      minStayDays = arrivalRate.minStayDays
    }
  }
  return Number(totalDays) >= Number(minStayDays)
}

/*
 * this method accepts as arguments:
 *   totalAmount - amount without VAT
 *   tax options: taxEnabled, taxIncluded, taxPercentage
 *
 *   Let's say we have totalAmount = 100 and taxPercentage = 50%
 *   There are 3 possible cases:
 *   1) No Vat (taxEnabled = false):
 *      then the result of this method is { totalAmount: 100, tax: 0 }
 *   2) Tax Excluded (taxEnabled = true, taxIncluded=false):
 *      then the result of this method is { totalAmount: 100, tax: 50 }
 *   3) Tax Included (taxEnabled = true, taxIncluded=true):
 *      then the result of this method is { totalAmount: 100, tax: 50 }
 * */
const calculateTotalTax = (totalAmount, { taxEnabled, taxIncluded, taxPercentage }) => {
  if (!taxEnabled || taxPercentage < 0) {
    return { totalAmount, tax: 0 }
  }
  // If tax is excluded
  if (!taxIncluded) {
    return { totalAmount, tax: (taxPercentage * totalAmount) / 100 }
  }

  // If tax is included then we receive total without tax
  const newTotalAmountWithVAT = totalAmount * (1 + (taxPercentage / 100))

  return { totalAmount, tax: newTotalAmountWithVAT - totalAmount }
}

module.exports = dao({
  tableName: TABLE_NAME,
  methods: {
    getRateByDates,
    calculateTotalTax,
    isSelfServiceAllowed,
    isMinStayDaysAllowed,
    calculateNightlyRates,
  },
})
