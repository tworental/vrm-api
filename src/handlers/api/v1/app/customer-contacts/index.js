const express = require('express')

const auth = require('../../../../../middlewares/authorize')
const { PERMISSIONS: { CUSTOMER_CONTACTS }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.get('/', auth([CUSTOMER_CONTACTS, ABILITIES.READ]), require('./list'))
app.post('/', auth([CUSTOMER_CONTACTS, ABILITIES.WRITE]), require('./create'))
app.get('/:id', auth([CUSTOMER_CONTACTS, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([CUSTOMER_CONTACTS, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([CUSTOMER_CONTACTS, ABILITIES.DELETE]), require('./delete'))

module.exports = app
