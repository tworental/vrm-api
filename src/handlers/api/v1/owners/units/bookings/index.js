const { Router } = require('express')

const router = Router({ mergeParams: true })

router.get('/', require('./list'))
router.get('/availability', require('./availability'))
router.post('/', require('./create'))

module.exports = router
