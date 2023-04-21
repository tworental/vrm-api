const express = require('express')

const authorizers = require('../../../../../models/v1/sales-channels/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { SALES_CHANNELS }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.get('/', auth([SALES_CHANNELS, ABILITIES.READ]), require('./list'))
app.post('/', auth([SALES_CHANNELS, ABILITIES.WRITE]), require('./create'))
app.get('/:id', auth([SALES_CHANNELS, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([SALES_CHANNELS, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([SALES_CHANNELS, ABILITIES.DELETE]), require('./delete'))

module.exports = app
