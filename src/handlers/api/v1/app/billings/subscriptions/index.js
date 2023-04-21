const express = require('express')

const auth = require('../../../../../../middlewares/authorize')
const { PERMISSIONS: { BILLINGS }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const app = express()

app.get('/', auth([BILLINGS, ABILITIES.READ]), require('./list'))
app.patch('/:id', auth([BILLINGS, ABILITIES.WRITE]), require('./update'))

module.exports = app
