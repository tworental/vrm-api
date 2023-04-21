const { Router } = require('express')

const { module: servicesModule } = require('../../../../../../models/v1/services/authorizers')
const { module: propertyModule } = require('../../../../../../models/v1/properties/authorizers')
const auth = require('../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../middlewares/limits')
const { PERMISSIONS: { PROPERTIES }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.use(checkLimit(servicesModule))
router.use(checkLimit(propertyModule))

router.get('/', auth([PROPERTIES, ABILITIES.READ]), require('./list'))
router.post('/', auth([PROPERTIES, ABILITIES.WRITE]), require('./create'))
router.delete('/:id', auth([PROPERTIES, ABILITIES.DELETE]), require('./delete'))

module.exports = router
