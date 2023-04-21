const express = require('express')

const authorizers = require('../../../../../models/v1/storage/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')

const app = express()

app.use(checkLimit(authorizers.module))

app.use('/files', require('./files'))
app.use('/folders', require('./folders'))

app.get('/quota', require('./quota'))
app.get('/download', auth('storage:read'), require('./download'))

module.exports = app
