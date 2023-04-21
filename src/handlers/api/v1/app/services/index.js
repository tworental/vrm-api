const express = require('express')

const authorizers = require('../../../../../models/v1/services/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { SERVICES }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.use('/:serviceId/reminders', require('./reminders'))

app.get('/', auth([SERVICES, ABILITIES.READ]), require('./list'))
app.post('/', auth([SERVICES, ABILITIES.WRITE]), checkLimit(authorizers.quota), require('./create'))
app.get('/:id', auth([SERVICES, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([SERVICES, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([SERVICES, ABILITIES.DELETE]), require('./delete'))

module.exports = app
