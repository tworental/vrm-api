const express = require('express')

const app = express()

app.get('/healthz', require('./healthz'))

app.use('/', require('./v1'))

module.exports = app
