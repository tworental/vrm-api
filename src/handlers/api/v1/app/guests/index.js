const express = require('express')

const authorizers = require('../../../../../models/v1/guests/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { GUESTS }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.get('/', auth([GUESTS, ABILITIES.READ]), require('./list'))
app.post('/', auth([GUESTS, ABILITIES.WRITE]), require('./create'))
app.get('/:id', auth([GUESTS, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([GUESTS, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([GUESTS, ABILITIES.DELETE]), require('./delete'))

module.exports = app
