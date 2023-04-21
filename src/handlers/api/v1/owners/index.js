const express = require('express')

const app = express()

const { jwtOwnerGuard } = require('../../../../middlewares/guards')

app.use('/auth', require('./auth'))
app.use('/me', jwtOwnerGuard, require('./me'))
app.use('/statistics', jwtOwnerGuard, require('./statistics'))
app.use('/units', jwtOwnerGuard, require('./units'))
app.use('/reports', jwtOwnerGuard, require('./reports'))
app.get('/config', jwtOwnerGuard, require('./config'))

module.exports = app
