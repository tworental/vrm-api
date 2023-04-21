const express = require('express')

const authorizers = require('../../../../../models/v1/fees/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { FEES }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.get('/', auth([FEES, ABILITIES.READ]), require('./list'))
app.post('/', auth([FEES, ABILITIES.WRITE]), checkLimit(authorizers.quota), require('./create'))
app.get('/:id', auth([FEES, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([FEES, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([FEES, ABILITIES.DELETE]), require('./delete'))

module.exports = app
