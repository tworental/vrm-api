const express = require('express')

const authorizers = require('../../../../../models/v1/taxes/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { WEBSITES }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))
app.use('/:websiteId/pages', require('./pages'))

app.get('/', auth([WEBSITES, ABILITIES.READ]), require('./list'))
app.post('/', auth([WEBSITES, ABILITIES.WRITE]), require('./create'))
app.get('/:id', auth([WEBSITES, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([WEBSITES, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([WEBSITES, ABILITIES.DELETE]), require('./delete'))

module.exports = app
