const { Router } = require('express')

const { module: propertyAuthorizer } = require('../../../../../../models/v1/properties/authorizers')
const { module: channelsAuthorizer } = require('../../../../../../models/v1/channel-managers/authorizers')
const auth = require('../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../middlewares/limits')
const { PERMISSIONS: { CHANNELS }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.use(checkLimit(propertyAuthorizer))
router.use(checkLimit(channelsAuthorizer))

router.get('/', auth([CHANNELS, ABILITIES.READ]), require('./list'))
router.get('/:channelId/embed', auth([CHANNELS, ABILITIES.READ]), require('./embed'))
router.post('/:channelId/sync', auth([CHANNELS, ABILITIES.WRITE]), require('./sync'))
router.patch('/:channelId', auth([CHANNELS, ABILITIES.WRITE]), require('./update'))

module.exports = router
