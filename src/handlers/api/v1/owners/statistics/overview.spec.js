const roundTo = require('round-to')

const { handler } = require('../../../../../services/http')
const { avgArray, sumArray } = require('../../../../../services/number')
const { selectBy: selectUnitsBy } = require('../../../../../models/v1/units/repositories')
const {
  occupancyByYear,
  calculateOccupancy,
  totalRevenue,
} = require('../../../../../models/v1/statistics/repositories')

jest.mock('round-to')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/number')
jest.mock('../../../../../models/v1/units/repositories')
jest.mock('../../../../../models/v1/statistics/repositories')

const httpHandler = require('./overview')

describe('GET /v1/owners/statistics/overview', () => {
  const ownerId = 1
  const accountId = 1
  const currency = 'EUR'
  const year = 2021

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display 4 types of statistics', async () => {
    const results = {
      data: {
        year,
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        currency,
        statistics: [
          {
            type: 'OWNER_REVENUE',
            total: 200,
            data: [100, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          },
          {
            type: 'OCCUPANCY',
            amount: 100,
            data: [30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          },
          {
            type: 'AVG_NIGHTLY_RATE',
            total: 100,
            data: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
          },
          {
            type: 'BOOKED_NIGHTS',
            total: 200,
            data: [24, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          },
        ],
      },
    }

    const units = [
      { id: 1 },
    ]
    const occupancyData = {
      [year]: [
        [{ totalNights: 24, amount: 100 }],
        [{ totalNights: 6, amount: 50 }],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    }
    const occupancy = {
      data: [
        { occupancy: 30 },
        { occupancy: 30 },
        { occupancy: 0 },
        { occupancy: 0 },
        { occupancy: 0 },
        { occupancy: 0 },
        { occupancy: 0 },
        { occupancy: 0 },
        { occupancy: 0 },
        { occupancy: 0 },
        { occupancy: 0 },
        { occupancy: 0 },
      ],
    }

    const revenueData = {
      [year]: [
        { total: 100 },
        { total: 50 },
        { total: 0 },
        { total: 0 },
        { total: 0 },
        { total: 0 },
        { total: 0 },
        { total: 0 },
        { total: 0 },
        { total: 0 },
        { total: 0 },
        { total: 0 },
      ],
    }

    roundTo.mockImplementation((a) => a)
    avgArray.mockReturnValue(100)
    sumArray.mockReturnValue(200)

    const json = jest.fn().mockImplementation((args) => args)

    selectUnitsBy.mockResolvedValue(units)

    const occupancyFn = jest.fn().mockResolvedValue(occupancyData)
    occupancyByYear.mockReturnValue(occupancyFn)
    calculateOccupancy.mockReturnValue(occupancy)

    const totalRevenueFn = jest.fn().mockResolvedValue(revenueData)
    totalRevenue.mockReturnValue(totalRevenueFn)

    await expect(httpHandler({
      user: { id: ownerId, accountId },
      account: { settings: { currency } },
      query: { year },
    }, { json }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()

    expect(selectUnitsBy).toBeCalledWith({ ownerId })

    expect(occupancyByYear).toBeCalledWith(accountId)
    expect(occupancyFn).toBeCalledWith([year], null, [1])
    expect(calculateOccupancy).toBeCalledWith(occupancyData[year])

    expect(totalRevenue).toBeCalledWith(accountId)
    expect(totalRevenueFn).toBeCalledWith([year], null, [1])

    expect(json).toBeCalledWith(results)
  })
})
