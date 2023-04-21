const express = require('express')

const auth = require('../../../../../../../middlewares/authorize')
const { PERMISSIONS: { RATE_SEASONS }, ABILITIES } = require('../../../../../../../models/v1/permissions/constants')

const router = express.Router({ mergeParams: true })

router.get('/', auth([RATE_SEASONS, ABILITIES.READ]), require('./list'))
router.post('/', auth([RATE_SEASONS, ABILITIES.WRITE]), require('./create'))
router.get('/:id', auth([RATE_SEASONS, ABILITIES.READ]), require('./show'))
router.patch('/:id', auth([RATE_SEASONS, ABILITIES.WRITE]), require('./update'))
router.delete('/:id', auth([RATE_SEASONS, ABILITIES.DELETE]), require('./delete'))

module.exports = router
