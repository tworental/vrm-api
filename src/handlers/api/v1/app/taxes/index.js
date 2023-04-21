const express = require('express')

const authorizers = require('../../../../../models/v1/taxes/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { TAXES }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.get('/', auth([TAXES, ABILITIES.READ]), require('./list'))
app.post('/', auth([TAXES, ABILITIES.WRITE]), checkLimit(authorizers.quota), require('./create'))
app.get('/:id', auth([TAXES, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([TAXES, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([TAXES, ABILITIES.DELETE]), require('./delete'))

module.exports = app
