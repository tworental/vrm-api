const { Router } = require('express')

const auth = require('../../../../../../../middlewares/authorize')
const { PERMISSIONS: { WEBSITES }, ABILITIES } = require('../../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.get('/', auth([WEBSITES, ABILITIES.READ]), require('./list'))

module.exports = router
