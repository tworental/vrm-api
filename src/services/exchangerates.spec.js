const config = require('config')
const { get } = require('./request')

jest.mock('config')
jest.mock('./request')

const exchangeratesService = require('./exchangerates')

describe('exchangerates service', () => {
  it('get latest rates', async () => {
    const results = 'results'

    get.mockResolvedValue(results)

    await expect(exchangeratesService.getLatestRates()).resolves.toEqual(results)

    expect(get).toBeCalledWith([
      'exchangeRatesApi.urllatest',
      '?base=payments.defaultCurrency',
      '&access_key=exchangeRatesApi.apiKey',
    ].join(''))
    expect(config.get).toHaveBeenNthCalledWith(1, 'exchangeRatesApi.url')
    expect(config.get).toHaveBeenNthCalledWith(2, 'exchangeRatesApi.apiKey')
    expect(config.get).toHaveBeenNthCalledWith(3, 'payments.defaultCurrency')
  })
})
