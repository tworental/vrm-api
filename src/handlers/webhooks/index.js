const express = require('express')

const app = express()

app.use('/channex', require('./channex'))

app.post('/paypal/ipn', require('./paypal'))
app.post('/stripe', require('./stripe'))

module.exports = app
