const config = require('config')
const { get } = require('./request')

const API_URL = config.get('exchangeRatesApi.url')
const ACCESS_KEY = config.get('exchangeRatesApi.apiKey')
const BASE_CURRENCY = config.get('payments.defaultCurrency')

exports.getLatestRates = () => get(`${API_URL}latest?base=${BASE_CURRENCY}&access_key=${ACCESS_KEY}`)
