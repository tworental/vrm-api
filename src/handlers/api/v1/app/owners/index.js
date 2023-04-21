const express = require('express')

const authorizers = require('../../../../../models/v1/owners/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { OWNERS }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.get('/', auth([OWNERS, ABILITIES.READ]), require('./list'))
app.post('/', auth([OWNERS, ABILITIES.WRITE]), require('./create'))
app.get('/:id', auth([OWNERS, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([OWNERS, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([OWNERS, ABILITIES.DELETE]), require('./delete'))
app.post('/:id/invite', auth([OWNERS, ABILITIES.WRITE]), require('./invite'))
app.post('/:id/lock', auth([OWNERS, ABILITIES.WRITE]), require('./lock'))
app.post('/:id/unlock', auth([OWNERS, ABILITIES.WRITE]), require('./unlock'))

module.exports = app
