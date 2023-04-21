const express = require('express')

const app = express()

app.get('/', require('./list'))
app.get('/:id/download', require('./download'))

module.exports = app
