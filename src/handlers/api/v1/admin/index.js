const express = require('express')

const app = express()

app.get('/', (req, res) => res.json({ data: 'admin' }))

module.exports = app
