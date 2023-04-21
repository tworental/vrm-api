const dao = require('../../../services/dao')
const { selectOne } = require('../../../services/database')

jest.mock('../../../services/dao')
jest.mock('../../../services/database')

const repository = require('./repositories')

describe('dict-currency-rates repositories', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'dict_currency_rates',
      jsonFields: ['rates'],
      methods: {
        amountByCurrency: expect.any(Function),
        exchangeCurrencyRateBy: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  describe('exchangeCurrencyRateBy', () => {
    it('should return currencyRate for not the same currencies with exchange rate', () => {
      const exchangeRates = { rates: { eur: 1, usd: 0.8 } }

      const fn = repository.methods.exchangeCurrencyRateBy(exchangeRates)

      expect(fn('USD', 'EUR')).toEqual(0.8)
    })

    it('should return currencyRate for not the same currencies without exchange rate', () => {
      const exchangeRates = { rates: { usd: 0.8 } }

      const fn = repository.methods.exchangeCurrencyRateBy(exchangeRates)

      expect(fn('USD', 'EUR')).toEqual(0.8)
    })

    it('should return currencyRate for the same currencies', () => {
      const fn = repository.methods.exchangeCurrencyRateBy()

      expect(fn('USD', 'USD')).toEqual(1)
    })

    it('should return currencyRate for the BASE_CURRENCY', () => {
      const fn = repository.methods.exchangeCurrencyRateBy()

      expect(fn('payments.defaultCurrency')).toEqual(1)
    })
  })

  describe('amountByCurrency', () => {
    it('should return 0 for total = 0', async () => {
      const orderBy = jest.fn().mockResolvedValue(null)

      selectOne.mockReturnValue({ orderBy })

      const fn = await repository.methods.amountByCurrency('EUR')

      expect(fn(0, 'USD')).toBe(0)

      expect(selectOne).toBeCalledWith('dict_currency_rates')
      expect(orderBy).toBeCalledWith('updated_at', 'desc')
    })

    it('should return 100 for total = 100', async () => {
      const orderBy = jest.fn().mockResolvedValue({
        rates: { eur: 1, usd: 0.8 },
      })

      selectOne.mockReturnValue({ orderBy })

      const fn = await repository.methods.amountByCurrency('EUR')

      expect(fn(100, 'USD')).toBe(80)

      expect(selectOne).toBeCalledWith('dict_currency_rates')
      expect(orderBy).toBeCalledWith('updated_at', 'desc')
    })
  })
})
