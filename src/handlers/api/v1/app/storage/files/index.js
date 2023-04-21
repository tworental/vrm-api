const express = require('express')

const authorizers = require('../../../../../../models/v1/storage/authorizers')
const auth = require('../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../middlewares/limits')
const { PERMISSIONS: { STORAGE }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const app = express()

app.get('/', auth([STORAGE, ABILITIES.READ]), require('./list'))
app.post('/', auth([STORAGE, ABILITIES.WRITE]), checkLimit(authorizers.quota), require('./create'))
app.delete('/', auth([STORAGE, ABILITIES.DELETE]), require('./delete'))
app.delete('/delete/hard', auth([STORAGE, ABILITIES.DELETE]), require('./deleteHard'))
app.get('/:id', auth([STORAGE, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([STORAGE, ABILITIES.WRITE]), require('./update'))
app.get('/:uuid/preview', auth([STORAGE, ABILITIES.READ]), require('./preview'))

module.exports = app
