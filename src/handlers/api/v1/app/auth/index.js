const express = require('express')

const { jwtUserGuard } = require('../../../../../middlewares/guards')

const app = express()

app.use('/account', require('./account'))
app.use('/oauth', require('./oauth'))

app.post('/signin', require('./signin'))
app.post('/signup', require('./signup'))
app.post('/validate', require('./validate'))

app.post('/password/reset', require('./password/reset'))
app.patch('/password/change', require('./password/change'))

app.delete('/signout', jwtUserGuard, require('./signout'))

module.exports = app
