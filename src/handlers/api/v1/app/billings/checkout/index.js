const express = require('express')

const auth = require('../../../../../../middlewares/authorize')
const { PERMISSIONS: { BILLINGS }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const app = express()

app.post('/', auth([BILLINGS, ABILITIES.WRITE]), require('./create'))
app.get('/:id', auth([BILLINGS, ABILITIES.READ]), require('./show'))

module.exports = app
