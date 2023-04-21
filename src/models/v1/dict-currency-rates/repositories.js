const config = require('config')

const { selectOne } = require('../../../services/database')
const dao = require('../../../services/dao')
const { TABLE_NAME } = require('./constants')

const BASE_CURRENCY = config.get('payments.defaultCurrency')

const exchangeCurrencyRateBy = (currencyExchangeRates) => {
  const exchangeRatesDict = currencyExchangeRates && currencyExchangeRates.rates
    ? currencyExchangeRates.rates
    : {}

  const currencyRates = Object.fromEntries(
    Object.entries(exchangeRatesDict).map(
      ([key, value]) => [key.toUpperCase(), value],
    ),
  )

  return (currency, baseCurrency = BASE_CURRENCY) => {
    let currencyRate = 1

    if (currency !== baseCurrency) {
      currencyRate = currencyRates[currency] / (currencyRates[baseCurrency] || currencyRate)
    }
    return currencyRate
  }
}

const amountByCurrency = async (defaultCurrency) => {
  const currencyExchangeRates = await selectOne(TABLE_NAME)
    .orderBy('updated_at', 'desc')

  const currencyRates = exchangeCurrencyRateBy(currencyExchangeRates)

  return (total, currency) => {
    if (total === 0) return 0

    return total * currencyRates(currency, defaultCurrency)
  }
}

module.exports = dao({
  tableName: TABLE_NAME,
  jsonFields: ['rates'],
  methods: {
    amountByCurrency,
    exchangeCurrencyRateBy,
  },
})
