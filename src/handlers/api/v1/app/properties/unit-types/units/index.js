const { Router } = require('express')

const authorizers = require('../../../../../../../models/v1/units/authorizers')
const auth = require('../../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../../middlewares/limits')
const { PERMISSIONS: { PROPERTIES }, ABILITIES } = require('../../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.get('/', auth([PROPERTIES, ABILITIES.READ]), require('./list'))
router.post('/', auth([PROPERTIES, ABILITIES.WRITE]), checkLimit(authorizers.quota), require('./create'))
router.get('/:id', auth([PROPERTIES, ABILITIES.READ]), require('./show'))
router.patch('/:id', auth([PROPERTIES, ABILITIES.WRITE]), require('./update'))
router.delete('/:id', auth([PROPERTIES, ABILITIES.DELETE]), require('./delete'))

module.exports = router
