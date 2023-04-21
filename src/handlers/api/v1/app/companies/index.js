const express = require('express')

const authorizers = require('../../../../../models/v1/companies/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { COMPANIES }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.get('/', auth([COMPANIES, ABILITIES.READ]), require('./list'))
app.post('/', auth([COMPANIES, ABILITIES.WRITE]), require('./create'))
app.get('/:id', auth([COMPANIES, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([COMPANIES, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([COMPANIES, ABILITIES.DELETE]), require('./delete'))

module.exports = app
