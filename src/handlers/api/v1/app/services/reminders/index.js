const { Router } = require('express')

const { module: servicesModule } = require('../../../../../../models/v1/services/authorizers')
const {
  module: servicesRemindersModule,
  quota: servicesRemindersQuota,
} = require('../../../../../../models/v1/service-reminders/authorizers')
const auth = require('../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../middlewares/limits')
const { PERMISSIONS: { SERVICES }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const router = Router({ mergeParams: true })

router.use(checkLimit(servicesModule))
router.use(checkLimit(servicesRemindersModule))

router.get('/', auth([SERVICES, ABILITIES.READ]), require('./list'))
router.post('/', auth([SERVICES, ABILITIES.WRITE]), checkLimit(servicesRemindersQuota), require('./create'))
router.get('/:id', auth([SERVICES, ABILITIES.READ]), require('./show'))
router.patch('/:id', auth([SERVICES, ABILITIES.WRITE]), require('./update'))
router.delete('/:id', auth([SERVICES, ABILITIES.DELETE]), require('./delete'))

module.exports = router
