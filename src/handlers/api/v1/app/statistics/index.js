const express = require('express')

const authorizers = require('../../../../../models/v1/statistics/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { STATISTICS }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.get('/revenue', auth([STATISTICS, ABILITIES.READ]), require('./revenue'))
app.get('/occupancy', auth([STATISTICS, ABILITIES.READ]), require('./occupancy'))
app.get('/reservations', auth([STATISTICS, ABILITIES.READ]), require('./reservations'))
app.get('/pace', auth([STATISTICS, ABILITIES.READ]), require('./pace'))

module.exports = app
