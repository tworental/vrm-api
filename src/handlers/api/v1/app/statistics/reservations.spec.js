const { handler } = require('../../../../../services/http')

const { amountByCurrency } = require('../../../../../models/v1/dict-currency-rates/repositories')
const { reservationsByCountry } = require('../../../../../models/v1/statistics/repositories')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/dict-currency-rates/repositories')
jest.mock('../../../../../models/v1/statistics/repositories')

const httpHandler = require('./reservations')

describe('GET /v1/app/statistics/reservations', () => {
  it('should return reservations statistics', async () => {
    const settings = { currency: 'eur' }
    const user = { accountId: 1 }
    const account = { settings }
    const query = { year: 2021, compareToYear: 2020, propertyId: 1 }

    const calculateTotalRate = jest.fn().mockImplementation((amount) => amount)
    amountByCurrency.mockResolvedValue(calculateTotalRate)

    const reservationsPromiseFn = jest.fn().mockResolvedValue({
      labels: ['Other', 'Austria'],
      data: {
        2020: [
          { currency: settings.currency, total: 100 },
          { currency: settings.currency, total: 300 },
        ],
        2021: [
          { currency: settings.currency, total: 200 },
          { currency: settings.currency, total: 600 },
        ],
      },
    })

    reservationsByCountry.mockReturnValue(reservationsPromiseFn)

    const response = {
      data: [
        {
          currency: settings.currency,
          year: '2020',
          labels: ['Other', 'Austria'],
          data: [25, 75],
          averageRate: [100, 300],
        },
        {
          currency: settings.currency,
          year: '2021',
          data: [25, 75],
          labels: ['Other', 'Austria'],
          averageRate: [
            200,
            600,
          ],
        },
      ],
    }

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user, account, query }, { json }))
      .resolves.toEqual(response)

    expect(reservationsPromiseFn).toBeCalledWith([2021, 2020], 1)
    expect(reservationsByCountry).toBeCalledWith(1)
    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
  })
})
