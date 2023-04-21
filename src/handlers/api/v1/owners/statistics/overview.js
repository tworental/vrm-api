const roundTo = require('round-to')

const { handler } = require('../../../../../services/http')
const { avgArray, sumArray } = require('../../../../../services/number')
const { selectBy: selectUnitsBy } = require('../../../../../models/v1/units/repositories')
const {
  occupancyByYear,
  calculateOccupancy,
  totalRevenue,
} = require('../../../../../models/v1/statistics/repositories')

module.exports = handler(async ({
  user: { id: ownerId, accountId },
  account: { settings: { currency } },
  query: { year },
}, res) => {
  const units = await selectUnitsBy({ ownerId })
  const ids = units.map((unit) => unit.id)

  const occupancyData = await occupancyByYear(accountId)([year], null, ids)
  const { data: occupancy } = calculateOccupancy(occupancyData[year])

  const bookedNights = occupancyData[year]
    .map((occupancyArray) => occupancyArray.reduce((acc, curr) => acc + curr.totalNights, 0))

  const revenueData = await totalRevenue(accountId)([year], null, ids)

  const revenue = revenueData[year].map((item) => item.total)

  const avgRates = occupancyData[year].map((item) => avgArray(item, 'amount'))
    .map((num) => roundTo(num, 2))

  const data = {
    year: Number(year),
    labels: Array.from(Array(12).keys()),
    currency,
    statistics: [
      {
        type: 'OWNER_REVENUE',
        total: roundTo(sumArray(revenue), 2),
        data: revenue,
      },
      {
        type: 'OCCUPANCY',
        amount: roundTo(avgArray(occupancy, 'occupancy'), 2),
        data: occupancy.map((item) => item.occupancy),
      },
      {
        type: 'AVG_NIGHTLY_RATE',
        total: roundTo(avgArray(avgRates), 2),
        data: avgRates,
      },
      {
        type: 'BOOKED_NIGHTS',
        total: roundTo(sumArray(bookedNights), 2),
        data: bookedNights,
      },
    ],
  }

  return res.json({ data })
})
