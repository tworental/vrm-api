const express = require('express')

const app = express()

app.get('/search', require('./geocode'))

module.exports = app
