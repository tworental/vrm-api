const express = require('express')

const app = express()

app.use('/app', require('./app'))
app.use('/owners', require('./owners'))
app.use('/tenants', require('./tenants'))
app.use('/admin', require('./admin'))

module.exports = app
