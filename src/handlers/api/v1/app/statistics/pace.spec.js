const { handler } = require('../../../../../services/http')

const { amountByCurrency } = require('../../../../../models/v1/dict-currency-rates/repositories')
const { occupancyByYear } = require('../../../../../models/v1/statistics/repositories')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/dict-currency-rates/repositories')
jest.mock('../../../../../models/v1/statistics/repositories')

const httpHandler = require('./pace')

describe('GET /v1/app/statistics/pace', () => {
  it('should return pace statistics', async () => {
    const settings = { currency: 'eur' }
    const user = { accountId: 1 }
    const account = { settings }
    const query = { year: 2021, compareToYear: 2020, propertyId: 1 }

    const calculateTotalRate = jest.fn().mockImplementation((amount) => amount)
    amountByCurrency.mockResolvedValue(calculateTotalRate)

    const occupancyPromiseFn = jest.fn().mockResolvedValue({
      2020: [
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
        [{ totalNights: 1, amount: 100, currency: settings.currency }],
      ],
      2021: [
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
        [{ totalNights: 2, amount: 300, currency: settings.currency }],
      ],
    })

    occupancyByYear.mockReturnValue(occupancyPromiseFn)

    const data = [
      {
        year: '2020',
        labels: Array.from(Array(12).keys()),
        data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        averagePrice: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      },
      {
        year: '2021',
        labels: Array.from(Array(12).keys()),
        data: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        averagePrice: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300],
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
