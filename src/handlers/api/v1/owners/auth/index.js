const express = require('express')

const app = express()

app.post('/signin', require('./signin'))
app.post('/validate', require('./validate'))

app.post('/password/reset', require('./password/reset'))
app.patch('/password/change', require('./password/change'))

app.patch('/account/confirmation', require('./account/confirmation'))

module.exports = app
