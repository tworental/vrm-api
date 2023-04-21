const express = require('express')

const { jwtUserGuard } = require('../../../../../../../middlewares/guards')

const app = express()

app.get('/retrieve', require('./retrieve'))
app.get('/retrieve-connect', require('./retrieve-connect'))

app.post('/request', require('./request'))
app.post('/connect', jwtUserGuard, require('./connect'))

app.delete('/disconnect', jwtUserGuard, require('./disconnect'))

module.exports = app
