const { Router } = require('express')

const authorizer = require('../../../../../../models/v1/integrations/authorizers')
const auth = require('../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../middlewares/limits')
const { PERMISSIONS: { INTEGRATIONS }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.use(checkLimit(authorizer.module))

router.post('/connect', auth([INTEGRATIONS, ABILITIES.READ]), require('./connect'))
router.get('/lists', auth([INTEGRATIONS, ABILITIES.READ]), require('./lists'))

module.exports = router
