exports.TABLE_NAME = 'documents_invoices'

exports.PAYMENT_TYPES = Object.values({
  CASH: 'cash',
  CHECK: 'check',
  CREDIT_CARD: 'cc',
  BANK_TRANSFER: 'bankTransfer',
  ONLINE: 'online',
  MOBILE: 'mobile',
  AUTO: 'auto',
})

exports.INVOICE_STATUSES = Object.values({
  DRAFT: 'draft',
  ISSUED: 'issued',
})

exports.TAX_NOTATIONS = Object.freeze({
  VAT: 'vat',
  GSTC: 'gst',
})

exports.INVOICE_TYPES = Object.freeze({
  INVOICE: 'invoice',
  PRO_FORMA: 'proForma',
  CORRECTION: 'correction',
})
