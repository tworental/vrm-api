const express = require('express')

const authorizers = require('../../../../../../models/v1/documents/invoices/authorizers')
const auth = require('../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../middlewares/limits')
const { PERMISSIONS: { DOCUMENTS_INVOICES }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const app = express()

app.use(checkLimit(authorizers.module))
app.get('/', auth([DOCUMENTS_INVOICES, ABILITIES.READ]), require('./list'))
app.post('/', auth([DOCUMENTS_INVOICES, ABILITIES.WRITE]), require('./create'))
app.get('/generate-number', auth([DOCUMENTS_INVOICES, ABILITIES.READ]), require('./generateNumber'))
app.get('/:id', auth([DOCUMENTS_INVOICES, ABILITIES.READ]), require('./show'))
app.get('/:id/download', auth([DOCUMENTS_INVOICES, ABILITIES.READ]), require('./download'))
app.patch('/:id', auth([DOCUMENTS_INVOICES, ABILITIES.WRITE]), require('./update'))
app.delete('/:id', auth([DOCUMENTS_INVOICES, ABILITIES.DELETE]), require('./delete'))

module.exports = app
