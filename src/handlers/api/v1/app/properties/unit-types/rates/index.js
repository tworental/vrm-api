const express = require('express')

const auth = require('../../../../../../../middlewares/authorize')
const { PERMISSIONS: { PROPERTIES }, ABILITIES } = require('../../../../../../../models/v1/permissions/constants')

const router = express.Router({ mergeParams: true })

router.get('/', auth([PROPERTIES, ABILITIES.READ]), require('./show'))
router.patch('/', auth([PROPERTIES, ABILITIES.WRITE]), require('./update'))

module.exports = router
