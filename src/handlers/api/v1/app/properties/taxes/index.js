const { Router } = require('express')

const { module: taxesModule } = require('../../../../../../models/v1/taxes/authorizers')
const { module: propertyModule } = require('../../../../../../models/v1/properties/authorizers')
const auth = require('../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../middlewares/limits')
const { PERMISSIONS: { PROPERTIES }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.use(checkLimit(taxesModule))
router.use(checkLimit(propertyModule))

router.get('/', auth([PROPERTIES, ABILITIES.READ]), require('./list'))
router.post('/', auth([PROPERTIES, ABILITIES.WRITE]), require('./create'))
router.delete('/:id', auth([PROPERTIES, ABILITIES.DELETE]), require('./delete'))

module.exports = router
