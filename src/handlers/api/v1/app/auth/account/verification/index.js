const express = require('express')

const { jwtUserGuard } = require('../../../../../../../middlewares/guards')

const app = express()

app.use('/email', require('./email'))
app.use('/phone', jwtUserGuard, require('./phone'))

module.exports = app
