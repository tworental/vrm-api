const { Router } = require('express')

const auth = require('../../../../../../middlewares/authorize')
const { PERMISSIONS: { WEBSITES }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.use('/:websitePageId/tags', require('./tags'))
router.use('/:websitePageId/contents', require('./contents'))

router.get('/', auth([WEBSITES, ABILITIES.READ]), require('./list'))
router.post('/', auth([WEBSITES, ABILITIES.WRITE]), require('./create'))
router.get('/:id', auth([WEBSITES, ABILITIES.READ]), require('./show'))
router.patch('/:id', auth([WEBSITES, ABILITIES.WRITE]), require('./update'))
router.delete('/:id', auth([WEBSITES, ABILITIES.DELETE]), require('./delete'))

module.exports = router
