const express = require('express')

const authorizers = require('../../../../../../models/v1/documents/invoices/authorizers')
const auth = require('../../../../../../middlewares/authorize')
const checkLimit = require('../../../../../../middlewares/limits')
const { PERMISSIONS: { DOCUMENTS_INVOICES }, ABILITIES } = require('../../../../../../models/v1/permissions/constants')

const router = express.Router({ mergeParams: true })

router.use(checkLimit(authorizers.module))

router.get('/download', auth([DOCUMENTS_INVOICES, ABILITIES.READ]), require('./download'))

module.exports = router
