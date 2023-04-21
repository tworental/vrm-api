const express = require('express')

const auth = require('../../../../../middlewares/authorize')
const { PERMISSIONS: { ACCOUNT }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const app = express()

app.get('/', require('./show'))
app.delete('/', require('./delete'))
app.patch('/', auth([ACCOUNT, ABILITIES.WRITE]), require('./update'))
app.get('/setup-progress', require('./setupProgress'))

module.exports = app
