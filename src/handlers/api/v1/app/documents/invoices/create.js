const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { i18n } = require('../../../../../../services/i18n')
const {
  selectOneBy,
  calculateInvoice,
  getInvoiceTitle,
  generateInvoice,
} = require('../../../../../../models/v1/documents/invoices/repositories')
const { getLimitByKey } = require('../../../../../../models/v1/limits/repositories')
const {
  selectOneBy: selectInvoiceSettings,
} = require('../../../../../../models/v1/documents/invoices/settings/repositories')
const { LIMITS } = require('../../../../../../models/v1/limits/constants')
const { INVOICE_TYPES } = require('../../../../../../models/v1/documents/invoices/constants')
const {
  DEFAULT_LANGUAGE: DEFAULT_INVOICE_LANGUAGE,
} = require('../../../../../../models/v1/languages/constants')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/documents/invoices/schema')

module.exports = handler(async ({
  body,
  limits,
  account: { settings: { locale } },
  user: { accountId },
}, res) => {
  const payload = await validate(body, { schema: CREATE_SCHEMA })

  if (await selectOneBy({ accountId, invoiceNo: payload.invoiceNo })) {
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
      // NOTE: For type: 'invoice' we don't need invoiceId!
      delete payload.invoiceId
      break
  }

  const invoiceSettings = await selectInvoiceSettings({ accountId })

  const settingsLanguage = (invoiceSettings && invoiceSettings.language) || DEFAULT_INVOICE_LANGUAGE

  const t = i18n(settingsLanguage, {
    locales: getLimitByKey(LIMITS.APP_DOCUMENTS_INVOICES_LANGUAGES_LIST, limits, [DEFAULT_INVOICE_LANGUAGE]),
  })

  const data = {
    ...calculateInvoice(payload),
    invoiceTitle: t(getInvoiceTitle(payload.invoiceType)),
    accountId,
  }

  const id = await generateInvoice(data, { locale, t })

  cache.del([
    `accounts.${accountId}.invoices.pagination.*`,
  ])

  return res.json({ data: { id } })
})
