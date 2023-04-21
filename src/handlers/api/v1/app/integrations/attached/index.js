const { Router } = require('express')

const authorizer = require('../../../../../../models/v1/integrations/authorizers')
const auth = require('../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../middlewares/limits')
const { PERMISSIONS: { INTEGRATIONS }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.use(checkLimit(authorizer.module))

router.get('/', auth([INTEGRATIONS, ABILITIES.READ]), require('./show'))
router.post('/', auth([INTEGRATIONS, ABILITIES.WRITE]), require('./upsert'))

module.exports = router
