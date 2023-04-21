const express = require('express')

const app = express()

app.get('/', require('./list'))
app.post('/translate', require('./translate'))

module.exports = app
