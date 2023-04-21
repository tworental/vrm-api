const { handler } = require('../../../../../services/http')
const { occupancyByYear } = require('../../../../../models/v1/statistics/repositories')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/statistics/repositories')

const httpHandler = require('./occupancy')

describe('GET /v1/app/statistics/occupancy', () => {
  it('should return occupancy statistics', async () => {
    const settings = { currency: 'eur' }
    const user = { accountId: 1 }
    const account = { settings }
    const query = { year: 2021, compareToYear: 2020, propertyId: 1 }

    const occupancyPromiseFn = jest.fn().mockResolvedValue({
      2020: [
        [
          { totalNights: 2, daysInMonth: 30 },
          { totalNights: 4, daysInMonth: 31 },
        ],
      ],
      2021: [
        [
          { totalNights: 30, daysInMonth: 30 },
          { totalNights: 8, daysInMonth: 31 },
        ],
      ],
    })

    occupancyByYear.mockReturnValue(occupancyPromiseFn)

    const data = [
      {
        year: '2020',
        data: [
          {
            occupancy: 9.78,
            unitsNumber: 2,
          },
        ],
      },
      {
        year: '2021',
        data: [
          {
            occupancy: 62.9,
            unitsNumber: 2,
          },
        ],
      },
    ]

    const response = { data }

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user, account, query }, { json }))
      .resolves.toEqual(response)

    expect(occupancyPromiseFn).toBeCalledWith([2021, 2020], 1)
    expect(occupancyByYear).toBeCalledWith(1)
    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
  })
})
