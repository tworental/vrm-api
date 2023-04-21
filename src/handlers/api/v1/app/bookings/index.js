const express = require('express')

const authorizers = require('../../../../../models/v1/bookings/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { BOOKINGS }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const router = express.Router()

router.use(checkLimit(authorizers.module))

router.use('/:bookingId/guests', require('./guests'))
router.use('/:bookingId/extras', require('./extras'))
router.use('/:bookingId/payments', require('./payments'))
router.use('/:bookingId/invoices', require('./invoices'))

router.get('/availability', auth([BOOKINGS, ABILITIES.READ]), require('./availability'))

router.get('/', auth([BOOKINGS, ABILITIES.READ]), require('./list'))
router.post('/', auth([BOOKINGS, ABILITIES.WRITE]), require('./create'))
router.get('/:id', auth([BOOKINGS, ABILITIES.READ]), require('./show'))
router.patch('/:id', auth([BOOKINGS, ABILITIES.WRITE]), require('./update'))
router.delete('/:id', auth([BOOKINGS, ABILITIES.DELETE]), require('./delete'))

module.exports = router
