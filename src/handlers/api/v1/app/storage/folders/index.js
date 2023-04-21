const express = require('express')

const auth = require('../../../../../../middlewares/authorize')
const { PERMISSIONS: { STORAGE }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const app = express()

app.get('/', auth([STORAGE, ABILITIES.READ]), require('./list'))
app.post('/', auth([STORAGE, ABILITIES.WRITE]), require('./create'))
app.delete('/', auth([STORAGE, ABILITIES.DELETE]), require('./delete'))
app.delete('/delete/hard', auth([STORAGE, ABILITIES.DELETE]), require('./deleteHard'))
app.get('/:id', auth([STORAGE, ABILITIES.READ]), require('./show'))
app.patch('/:id', auth([STORAGE, ABILITIES.WRITE]), require('./update'))

module.exports = app
