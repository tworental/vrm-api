const express = require('express')

const authorizers = require('../../../../../models/v1/rate-seasons/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { RATE_SEASONS }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.get('/', auth([RATE_SEASONS, ABILITIES.READ]), require('./list'))
app.post('/', auth([RATE_SEASONS, ABILITIES.WRITE]), checkLimit(authorizers.quota), require('./create'))
app.get('/:id', auth([RATE_SEASONS, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([RATE_SEASONS, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([RATE_SEASONS, ABILITIES.DELETE]), require('./delete'))

module.exports = app
