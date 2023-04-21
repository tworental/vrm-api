const express = require('express')

const auth = require('../../../../../middlewares/authorize')
const { PERMISSIONS: { BILLINGS }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use('/plans', require('./plans'))
app.use('/checkout', require('./checkout'))
app.use('/subscriptions', require('./subscriptions'))

app.post('/session', auth([BILLINGS, ABILITIES.READ]), require('./session'))

module.exports = app
