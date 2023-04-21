const { handler } = require('../../../../../services/http')
const { amountByCurrency } = require('../../../../../models/v1/dict-currency-rates/repositories')
const { totalRevenue } = require('../../../../../models/v1/statistics/repositories')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/dict-currency-rates/repositories')
jest.mock('../../../../../models/v1/statistics/repositories')

const httpHandler = require('./revenue')

describe('GET /v1/app/statistics/revenue', () => {
  it('should return revenue statistics', async () => {
    const settings = { currency: 'eur' }
    const user = { accountId: 1 }
    const account = { settings }
    const query = { year: 2021, compareToYear: 2020, propertyId: 1 }

    const calculateTotalRate = jest.fn().mockImplementation((amount) => amount)
    amountByCurrency.mockResolvedValue(calculateTotalRate)

    const revenuePromiseFn = jest.fn().mockResolvedValue({
      2020: [
        { total: 200, currency: settings.currency },
        { total: 200, currency: settings.currency },
        { total: 200, currency: settings.currency },
        { total: 200, currency: settings.currency },
        { total: 200, currency: settings.currency },
        { total: 200, currency: settings.currency },
        { total: 200, currency: settings.currency },
        { total: 200, currency: settings.currency },
        { total: 200, currency: settings.currency },
        { total: 200, currency: settings.currency },
        { total: 200, currency: settings.currency },
        { total: 200, currency: settings.currency },
      ],
      2021: [
        { total: 400, currency: settings.currency },
        { total: 400, currency: settings.currency },
        { total: 400, currency: settings.currency },
        { total: 400, currency: settings.currency },
        { total: 400, currency: settings.currency },
        { total: 400, currency: settings.currency },
        { total: 400, currency: settings.currency },
        { total: 400, currency: settings.currency },
        { total: 400, currency: settings.currency },
        { total: 400, currency: settings.currency },
        { total: 400, currency: settings.currency },
        { total: 400, currency: settings.currency },
      ],
    })

    totalRevenue.mockReturnValue(revenuePromiseFn)

    const data = [
      {
        year: '2020',
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        total: 2400,
        data: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
        change: 0,
        currency: settings.currency,
      },
      {
        year: '2021',
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        total: 4800,
        data: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400],
        change: 1,
        currency: settings.currency,
      },
    ]

    const response = { data }

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user, account, query }, { json }))
      .resolves.toEqual(response)

    expect(totalRevenue).toBeCalledWith(1)
    expect(revenuePromiseFn).toBeCalledWith([2021, 2020], 1)
    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
  })
})
