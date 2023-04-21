const { Router } = require('express')

const auth = require('../../../../../../../middlewares/authorize')
const { PERMISSIONS: { WEBSITES }, ABILITIES } = require('../../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.post('/', auth([WEBSITES, ABILITIES.WRITE]), require('./create'))
router.get('/:id', auth([WEBSITES, ABILITIES.READ]), require('./show'))

module.exports = router
