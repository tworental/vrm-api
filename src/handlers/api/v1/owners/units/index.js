const express = require('express')

const app = express()

app.get('/', require('./list'))
app.get('/:id', require('./show'))

app.use('/:id/bookings', require('./bookings'))

module.exports = app
