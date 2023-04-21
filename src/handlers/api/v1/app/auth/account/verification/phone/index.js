const express = require('express')

const app = express()

app.post('/request', require('./request'))
app.patch('/confirm', require('./confirm'))

module.exports = app
