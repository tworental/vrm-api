const express = require('express')

const app = express()

app.use('/google', require('./google'))

module.exports = app
