const express = require('express')

const authorizers = require('../../../../../models/v1/channel-managers/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { CHANNELS }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.get('/', auth([CHANNELS, ABILITIES.READ]), require('./list'))
app.patch('/:id', auth([CHANNELS, ABILITIES.WRITE]), require('./update'))

module.exports = app
