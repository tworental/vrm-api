const express = require('express')

const app = express()

app.use('/verification', require('./verification'))

module.exports = app
