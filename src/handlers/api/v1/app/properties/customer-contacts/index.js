const { Router } = require('express')

const authorizers = require('../../../../../../models/v1/properties/authorizers')
const auth = require('../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../middlewares/limits')
const { PERMISSIONS: { PROPERTIES }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.use(checkLimit(authorizers.module))

router.get('/', auth([PROPERTIES, ABILITIES.READ]), require('./list'))
router.post('/', auth([PROPERTIES, ABILITIES.WRITE]), require('./create'))
router.delete('/:id', auth([PROPERTIES, ABILITIES.WRITE]), require('./delete'))

module.exports = router
