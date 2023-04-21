const { handler } = require('../../../../../../services/http')
const {
  generateInvoiceNo,
} = require('../../../../../../models/v1/documents/invoices/repositories')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const invoiceNo = await generateInvoiceNo(accountId)

  return res.json({ data: invoiceNo })
})
