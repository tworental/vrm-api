const express = require('express')

const authorizer = require('../../../../../models/v1/properties/authorizers')
const auth = require('../../../../../middlewares/authorize')
const checkLimit = require('../../../../../middlewares/limits')
const { PERMISSIONS: { PROPERTIES }, ABILITIES } = require('../../../../../models/v1/permissions/constants')

const router = express.Router()

router.use(checkLimit(authorizer.module))

router.use('/:propertyId/unit-types', require('./unit-types'))
router.use('/:propertyId/customer-contacts', require('./customer-contacts'))
router.use('/:propertyId/images', require('./images'))
router.use('/:propertyId/services', require('./services'))
router.use('/:propertyId/channels', require('./channels'))
router.use('/:propertyId/taxes', require('./taxes'))
router.use('/:propertyId/fees', require('./fees'))

router.get('/', auth([PROPERTIES, ABILITIES.READ]), require('./list'))
router.post('/', auth([PROPERTIES, ABILITIES.WRITE]), checkLimit(authorizer.quota), require('./create'))
router.get('/calendar', auth([PROPERTIES, ABILITIES.READ]), require('./calendar'))
router.get('/:id', auth([PROPERTIES, ABILITIES.READ]), require('./show'))
router.patch('/:id', auth([PROPERTIES, ABILITIES.WRITE]), require('./update'))
router.delete('/:id', auth([PROPERTIES, ABILITIES.DELETE]), require('./delete'))

module.exports = router
