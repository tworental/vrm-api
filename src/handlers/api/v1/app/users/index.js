const express = require('express')

const authorizers = require('../../../../../models/v1/users/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { USERS }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.get('/', auth([USERS, ABILITIES.READ]), require('./list'))
app.post('/', auth([USERS, ABILITIES.WRITE]), checkLimit(authorizers.quota), require('./create'))
app.get('/:id', auth([USERS, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([USERS, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([USERS, ABILITIES.DELETE]), require('./delete'))
app.post('/:id/invite', auth([USERS, ABILITIES.WRITE]), require('./invite'))
app.post('/:id/lock', auth([USERS, ABILITIES.WRITE]), require('./lock'))
app.post('/:id/unlock', auth([USERS, ABILITIES.WRITE]), require('./unlock'))

module.exports = app
