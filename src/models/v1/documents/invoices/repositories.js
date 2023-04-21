const { selectOne } = require('../../../../services/database')
const { generatePdf } = require('../../../../services/invoice-pdf')
const { generate, populatePattern } = require('../../../../services/invoice-number')
const dao = require('../../../../services/dao')
const { toPdf } = require('./serializers')

const {
  selectOneBy: selectInvoiceSettings,
} = require('./settings/repositories')

const { TABLE_NAME, INVOICE_TYPES } = require('./constants')
const { DEFAULT_INVOICE_NO_PATTERN } = require('./settings/constants')

const getInvoiceTitle = (type) => {
  switch (type) {
    case INVOICE_TYPES.PRO_FORMA:
      return 'invoices.invoiceTitleProForma'

    case INVOICE_TYPES.CORRECTION:
      return 'invoices.invoiceTitleCorrection'

    default:
      return 'invoices.invoiceTitle'
  }
}

const calculateInvoice = (data) => {
  if (Array.isArray(data.invoiceItems)) {
    const invoiceItems = data.invoiceItems.map((item) => {
      const quantity = Number(item.quantity)
      const tax = Number(item.tax)
      const price = Number(item.price)
      const discount = Number(item.discount || 0)
      const net = quantity * price - discount
      const gross = net * ((tax / 100) + 1)

      return {
        name: item.name,
        quantity,
        tax,
        price,
        discount,
        net,
        gross,
      }
    })

    const totalAmounts = invoiceItems.reduce((acc, curr) => {
      acc.subtotalAmount += curr.net
      acc.totalAmount += curr.gross
      return acc
    }, { subtotalAmount: 0, totalAmount: 0 })

    return { ...data, ...totalAmounts, invoiceItems }
  }
  return data
}

const selectLastInvoice = (trx) => (
  selectOne(TABLE_NAME, {}, trx)
    .whereRaw('YEAR(invoice_date) = YEAR(NOW()) AND MONTH(invoice_date) = MONTH(NOW())')
    .orderBy('invoice_date', 'DESC')
)

const generateInvoice = async (data, { locale, t }, trx) => {
  const pdfBuffer = await generatePdf({ locale, ...toPdf(data) }, t)

  // module.exports is used because of needing to use method which is located in dao result.
  const { path } = await module.exports.uploadFile({
    name: `invoice-${data.invoiceNo}.pdf`,
    data: pdfBuffer,
  }, data.s3InvoicePath)(data.accountId, data.invoiceDate.substr(0, 7))

  if (data.id) {
    return module.exports.updateBy({ id: data.id }, { ...data, s3InvoicePath: path }, trx)
  }

  return module.exports.create({ ...data, s3InvoicePath: path }, trx)
}

const generateInvoiceNo = async (accountId) => {
  const invoiceSettings = await selectInvoiceSettings({ accountId })

  const pattern = invoiceSettings ? invoiceSettings.invoiceNoPattern : DEFAULT_INVOICE_NO_PATTERN

  const lastInvoice = await selectLastInvoice()

  const lastInvoiceNo = lastInvoice ? lastInvoice.invoiceNo : null

  if (lastInvoiceNo) {
    return generate(lastInvoiceNo)
  }

  return populatePattern(pattern)
}

module.exports = dao({
  tableName: TABLE_NAME,
  jsonFields: ['invoiceItems'],
  storageDir: 'documents/invoices',
  methods: {
    getInvoiceTitle,
    calculateInvoice,
    selectLastInvoice,
    generateInvoice,
    generateInvoiceNo,
  },
})
