const express = require('express')

const authorizers = require('../../../../../models/v1/integrations/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { INTEGRATIONS }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))

app.use('/mailchimp', require('./mailchimp'))
app.use('/:integrationId/attached', require('./attached'))

app.get('/', auth([INTEGRATIONS, ABILITIES.READ]), require('./list'))

module.exports = app
