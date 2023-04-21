const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { i18n } = require('../../../../../../services/i18n')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const {
  updateBy, selectOneBy, calculateInvoice, getInvoiceTitle,
} = require('../../../../../../models/v1/documents/invoices/repositories')
const {
  selectOneBy: selectInvoiceSettings,
} = require('../../../../../../models/v1/documents/invoices/settings/repositories')
const {
  DEFAULT_LANGUAGE: DEFAULT_INVOICE_LANGUAGE,
} = require('../../../../../../models/v1/languages/constants')
const { getLimitByKey } = require('../../../../../../models/v1/limits/repositories')
const { INVOICE_TYPES } = require('../../../../../../models/v1/documents/invoices/constants')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/documents/invoices/schema')
const { LIMITS } = require('../../../../../../models/v1/limits/constants')

module.exports = handler(async ({
  body,
  limits,
  params: { id },
  user: { accountId },
}, res) => {
  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  if (!await selectOneBy({ accountId, id })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (await selectOneBy({ accountId, invoiceNo: payload.invoiceNo }).where('id', '!=', id)) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { invoiceNo: ['exists'] },
    })
  }

  switch (payload.invoiceType) {
    case INVOICE_TYPES.CORRECTION:
      if (!payload.invoiceId || !await selectOneBy({ accountId, id: payload.invoiceId })) {
        throw createError(400, MESSAGES.VALIDATION_FAILED, {
          code: CODES.VALIDATION_FAILED,
          errors: { invoiceId: ['notExists'] },
        })
      }
      break

    default:
      // NOTE: For type: "invoice" we don't need invoiceId!
      delete payload.invoiceId
      break
  }

  const data = calculateInvoice(payload)

  if (payload.invoiceType) {
    const invoiceSettings = await selectInvoiceSettings({ accountId })

    const settingsLanguage = (invoiceSettings && invoiceSettings.language) || DEFAULT_INVOICE_LANGUAGE

    const t = i18n(settingsLanguage, {
      locales: getLimitByKey(LIMITS.APP_DOCUMENTS_INVOICES_LANGUAGES_LIST, limits, [DEFAULT_INVOICE_LANGUAGE]),
    })

    data.invoiceTitle = t(getInvoiceTitle(payload.invoiceType))
  }

  await updateBy({ id }, data)

  cache.del([
    `accounts.${accountId}.invoices.pagination.*`,
  ])

  return res.sendStatus(200)
})
