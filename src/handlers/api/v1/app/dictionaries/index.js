const express = require('express')

const app = express()

app.get('/countries', require('./countries'))
app.get('/arrangements', require('./arrangements'))
app.get('/amenities', require('./amenities'))
app.get('/property-types', require('./propertyTypes'))
app.get('/guest-types', require('./guestTypes'))
app.get('/currency-rates', require('./currencyRates'))
app.get('/fees', require('./fees'))

module.exports = app
