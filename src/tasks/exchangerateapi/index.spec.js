const { getLatestRates } = require('../../services/exchangerates')
const { create, selectOneBy } = require('../../models/v1/dict-currency-rates/repositories')

const exchangeRatesApi = require('./index')

jest.mock('../../services/exchangerates')
jest.mock('../../models/v1/dict-currency-rates/repositories')

describe('exchange rates api', () => {
  const results = { rates: 'rates', base: 'base', date: 'date' }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should fetch exchange rate and create', async () => {
    const whereRaw = jest.fn().mockResolvedValue(null)
    selectOneBy.mockReturnValue({ whereRaw })
    getLatestRates.mockResolvedValue(results)
    create.mockResolvedValue()

    await expect(exchangeRatesApi()).resolves.toBeUndefined()

    expect(selectOneBy).toBeCalledWith()
    expect(whereRaw).toBeCalledWith('date < NOW() - INTERVAL 6 HOUR')
    expect(getLatestRates).toBeCalled()
    expect(create).toBeCalledWith(results)
  })

  it('should do nothing if current date has data', async () => {
    const whereRaw = jest.fn().mockResolvedValue(results)
    selectOneBy.mockReturnValue({ whereRaw })

    await expect(exchangeRatesApi()).resolves.toBeUndefined()

    expect(selectOneBy).toBeCalledWith()
    expect(whereRaw).toBeCalledWith('date < NOW() - INTERVAL 6 HOUR')
    expect(getLatestRates).not.toBeCalled()
    expect(create).not.toBeCalled()
  })
})
