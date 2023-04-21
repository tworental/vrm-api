const { getConnection, raw } = require('../../../services/database')
const dayjs = require('../../../services/dayjs')
const { STATUSES } = require('../bookings/constants')

const DEFAULT_CURRENCY = 'EUR'

const reservationsByCountry = (accountId) => async (years = [], propertyId) => {
  const COUNTRIES_LIMIT = 5
  const OTHER_COUNTRY_CODE = 'OTHER'

  const statistics = await getConnection()
    .select([
      raw('YEAR(b.created_at) AS year'),
      raw('AVG(b.amount_total - b.amount_total_tax) AS total'),
      'g.country_code',
      'b.currency',
    ])
    .from('bookings AS b')
    .leftJoin('booking_guests AS bg', 'bg.booking_id', 'b.id')
    .leftJoin('guests AS g', 'bg.guest_id', 'g.id')
    .where('b.account_id', '=', accountId)
    .whereIn('b.status', [STATUSES.CONFIRMED])
    .whereRaw(`YEAR(b.created_at) IN (${years.join(',')})`)
    .andWhere((queryBuilder) => {
      if (propertyId) {
        queryBuilder.where('b.property_id', '=', propertyId)
      }
    })
    .groupByRaw('YEAR(b.created_at)')
    .groupBy('g.country_code')
    .orderByRaw('AVG(b.amount_total - b.amount_total_tax) DESC')
    .orderByRaw('YEAR(b.created_at) DESC')

  let results = statistics.sort((a, b) => (
    (a.countryCode === null) - (b.countryCode === null)
  )).map((item) => ({ ...item, countryCode: item.countryCode || OTHER_COUNTRY_CODE }))

  results = results.reduce((acc, curr) => {
    if (Object.keys(acc).length < COUNTRIES_LIMIT) {
      acc[curr.countryCode] = curr
    } else {
      acc[OTHER_COUNTRY_CODE] = {
        ...(acc[OTHER_COUNTRY_CODE] || curr),
        total: ((acc[OTHER_COUNTRY_CODE] || {}).total || 0) + curr.total,
      }
    }
    return acc
  }, {})

  const labels = Object.keys(results)

  const defaults = new Array(labels.length).fill({
    total: 0, currency: DEFAULT_CURRENCY,
  })

  const data = Object.values(results).reduce((acc, curr, index) => {
    acc[curr.year] = [...acc[curr.year] || defaults]
    acc[curr.year].splice(index, 1, curr)
    return acc
  }, { [years[0]]: defaults, [years[1]]: defaults })

  return { labels, data }
}

const totalRevenue = (accountId) => async (years = [], propertyId, unitIds) => {
  const results = await getConnection()
    .select([
      raw('YEAR(b.created_at) AS year'),
      raw('MONTH(b.created_at) AS month'),
      raw('SUM(b.amount_total - b.amount_total_tax) AS total'),
      'b.currency',
    ])
    .from('bookings AS b')
    .where('b.account_id', '=', accountId)
    .whereIn('b.status', [STATUSES.CONFIRMED])
    .whereRaw(`YEAR(b.created_at) IN (${years.join(',')})`)
    .andWhere((queryBuilder) => {
      if (propertyId) {
        queryBuilder.where('b.property_id', '=', propertyId)
      }
      if (unitIds) {
        queryBuilder.whereIn('b.property_unit_type_unit_id', unitIds)
      }
    })
    .groupByRaw('YEAR(b.created_at)')
    .groupByRaw('MONTH(b.created_at)')
    .orderByRaw('YEAR(b.created_at) DESC')
    .orderByRaw('MONTH(b.created_at) ASC')

  const defaults = new Array(12).fill({
    total: 0, currency: DEFAULT_CURRENCY,
  })

  return Object.values(results).reduce((acc, curr) => {
    acc[curr.year] = [...acc[curr.year] || defaults]
    acc[curr.year].splice(curr.month - 1, 1, {
      total: curr.total, currency: curr.currency,
    })

    return acc
  }, { [years[0]]: defaults, [years[1]]: defaults })
}

const occupancyByYear = (accountId) => async (years = [], propertyId, unitIds) => {
  const results = await getConnection()
    .select([
      'id',
      'property_unit_type_unit_id',
      'date_arrival',
      'date_departure',
      raw('(amount_total - amount_total_tax) AS amount_total'),
      'currency',
    ])
    .from('bookings')
    .where('account_id', '=', accountId)
    .whereIn('status', [STATUSES.CONFIRMED])
    .whereRaw(`YEAR(date_arrival) IN (${years.join(',')})`)
    .andWhere((queryBuilder) => {
      if (propertyId) {
        queryBuilder.where('property_id', '=', propertyId)
      }
      if (unitIds) {
        queryBuilder.whereIn('property_unit_type_unit_id', unitIds)
      }
    })
    .orderByRaw('YEAR(date_arrival) DESC')
    .orderByRaw('MONTH(date_arrival) ASC')

  const defaults = new Array(12).fill([])

  return results.reduce((acc, curr) => {
    const arrival = dayjs(curr.dateArrival)
    const departure = dayjs(curr.dateDeparture)

    // Required to calculate nights
    // for example: 01/01/2021 12:00 and 03/01/2021 06:00 must be 2 nights
    const arrivalWithNoTime = dayjs(curr.dateArrival)
      .set('milliseconds', 0)
      .set('seconds', 0)
      .set('minutes', 0)
      .set('hours', 0)
    const departureWithNoTime = dayjs(curr.dateDeparture)
      .set('milliseconds', 0)
      .set('seconds', 0)
      .set('minutes', 0)
      .set('hours', 0)

    const arrivalYear = arrival.get('year')
    const arrivalMonth = arrival.get('month')

    const departureYear = departure.get('year')
    const departureMonth = departure.get('month')

    acc[arrivalYear] = [...acc[arrivalYear] || defaults]
    acc[departureYear] = [...acc[departureYear] || defaults]

    if (arrivalYear === departureYear && arrivalMonth === departureMonth) {
      const totalNights = departureWithNoTime.diff(arrivalWithNoTime, 'day')

      if (totalNights > 0) {
        acc[arrivalYear][arrivalMonth] = [
          ...acc[arrivalYear][arrivalMonth],
          {
            propertyUnitTypeUnitId: curr.propertyUnitTypeUnitId,
            amount: curr.amountTotal / totalNights,
            currency: curr.currency,
            totalNights,
            daysInMonth: dayjs(new Date(arrivalYear, arrivalMonth)).daysInMonth(),
          },
        ]
      }
    } else {
      const arrivalTotalNights = arrival.daysInMonth() - arrival.get('date') + 1

      acc[arrivalYear][arrivalMonth] = [
        ...acc[arrivalYear][arrivalMonth],
        {
          propertyUnitTypeUnitId: curr.propertyUnitTypeUnitId,
          amount: curr.amountTotal / arrivalTotalNights,
          currency: curr.currency,
          totalNights: arrivalTotalNights,
          daysInMonth: dayjs(new Date(arrivalYear, arrivalMonth)).daysInMonth(),
        },
      ]

      const departureTotalNights = departure.diff(departure.startOf('month'), 'day')

      if (departureTotalNights > 0) {
        acc[departureYear][departureMonth] = [
          ...acc[departureYear][departureMonth],
          {
            propertyUnitTypeUnitId: curr.propertyUnitTypeUnitId,
            amount: curr.amountTotal / departureTotalNights,
            currency: curr.currency,
            totalNights: departureTotalNights,
            daysInMonth: dayjs(new Date(departureYear, departureMonth)).daysInMonth(),
          },
        ]
      }
    }

    return acc
  }, { [years[0]]: defaults, [years[1]]: defaults })
}

const calculateOccupancy = (items) => ({
  data: items.map((payload) => {
    const unitsNumber = payload.length

    let occupancy = payload.map(({ totalNights, daysInMonth }) => (
      totalNights !== daysInMonth ? (totalNights / daysInMonth) : 1
    )).reduce((a, b) => a + b, 0)

    if (occupancy > 0) {
      occupancy = Math.round((((occupancy / unitsNumber) * 100) + Number.EPSILON) * 100) / 100
    }

    return { unitsNumber, occupancy }
  }),
})

const occupancyByYearAndMonth = (accountId) => async (year, month, unitIds) => {
  const results = await getConnection()
    .select([
      'id',
      'property_unit_type_unit_id',
      'date_arrival',
      'date_departure',
      raw('(amount_total - amount_total_tax) AS amount_total'),
      'currency',
    ])
    .from('bookings')
    .where('account_id', '=', accountId)
    .whereIn('status', [STATUSES.CONFIRMED])
    .whereRaw('YEAR(date_arrival) = ? AND MONTH(date_arrival) = ?', [year, month])
    .andWhere((queryBuilder) => {
      if (unitIds) {
        queryBuilder.whereIn('property_unit_type_unit_id', unitIds)
      }
    })

  return results.reduce((acc, curr) => {
    let newAcc = acc
    const arrival = dayjs(curr.dateArrival)
    const departure = dayjs(curr.dateDeparture)

    // Required to calculate nights
    // for example: 01/01/2021 12:00 and 03/01/2021 06:00 must be 2 nights
    const arrivalWithNoTime = dayjs(curr.dateArrival)
      .set('milliseconds', 0)
      .set('seconds', 0)
      .set('minutes', 0)
      .set('hours', 0)
    const departureWithNoTime = dayjs(curr.dateDeparture)
      .set('milliseconds', 0)
      .set('seconds', 0)
      .set('minutes', 0)
      .set('hours', 0)

    const arrivalYear = arrival.get('year')
    const arrivalMonth = arrival.get('month')

    const departureYear = departure.get('year')
    const departureMonth = departure.get('month')

    if (arrivalYear === departureYear && arrivalMonth === departureMonth) {
      const totalNights = departureWithNoTime.diff(arrivalWithNoTime, 'day')

      if (totalNights > 0) {
        newAcc = [
          ...acc,
          {
            propertyUnitTypeUnitId: curr.propertyUnitTypeUnitId,
            amount: curr.amountTotal / totalNights,
            currency: curr.currency,
            totalNights,
            daysInMonth: dayjs(new Date(arrivalYear, arrivalMonth)).daysInMonth(),
          },
        ]
      }
    } else {
      const arrivalTotalNights = arrival.daysInMonth() - arrival.get('date') + 1

      newAcc = [
        ...acc,
        {
          propertyUnitTypeUnitId: curr.propertyUnitTypeUnitId,
          amount: curr.amountTotal / arrivalTotalNights,
          currency: curr.currency,
          totalNights: arrivalTotalNights,
          daysInMonth: dayjs(new Date(arrivalYear, arrivalMonth)).daysInMonth(),
        },
      ]

      const departureTotalNights = departure.diff(departure.startOf('month'), 'day')

      if (departureTotalNights > 0) {
        newAcc = [
          ...acc,
          {
            propertyUnitTypeUnitId: curr.propertyUnitTypeUnitId,
            amount: curr.amountTotal / departureTotalNights,
            currency: curr.currency,
            totalNights: departureTotalNights,
            daysInMonth: dayjs(new Date(departureYear, departureMonth)).daysInMonth(),
          },
        ]
      }
    }

    return newAcc
  }, [])
}

module.exports = {
  occupancyByYear,
  totalRevenue,
  reservationsByCountry,
  calculateOccupancy,
  occupancyByYearAndMonth,
}
