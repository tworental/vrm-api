const express = require('express')

const app = express()

app.get('/', require('./list'))

module.exports = app
