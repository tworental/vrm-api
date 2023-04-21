const { Router } = require('express')

const authorizer = require('../../../../../../models/v1/bookings/authorizers')
const auth = require('../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../middlewares/limits')
const { PERMISSIONS: { BOOKINGS }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.use(checkLimit(authorizer.module))

router.get('/', auth([BOOKINGS, ABILITIES.READ]), require('./list'))
router.post('/', auth([BOOKINGS, ABILITIES.WRITE]), require('./create'))
router.get('/:id', auth([BOOKINGS, ABILITIES.READ]), require('./show'))
router.patch('/:id', auth([BOOKINGS, ABILITIES.WRITE]), require('./update'))
router.delete('/:id', auth([BOOKINGS, ABILITIES.DELETE]), require('./delete'))

module.exports = router
