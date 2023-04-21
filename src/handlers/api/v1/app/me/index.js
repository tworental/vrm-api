const express = require('express')

const app = express()

app.get('/', require('./show'))
app.patch('/', require('./update'))

module.exports = app
