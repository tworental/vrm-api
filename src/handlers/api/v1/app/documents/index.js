const express = require('express')

const authorizers = require('../../../../../models/v1/documents/authorizers')
const checkLimit = require('../../../../../middlewares/limits')

const app = express()

app.use(checkLimit(authorizers.module))

app.use('/invoices', require('./invoices'))

module.exports = app
