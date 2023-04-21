const express = require('express')

const app = express()

app.get('/test_connection', require('./test-connection'))
app.get('/mapping_details', require('./mapping-details'))
app.post('/changes', require('./changes'))
app.post('/subscriptions', require('./subscriptions'))
app.post('/bookings', require('./bookings'))

module.exports = app
