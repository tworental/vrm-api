const path = require('path')
const PDFDocument = require('pdfkit')
const roundTo = require('round-to')
const currencyFormatter = require('currency-formatter')

const FONTS = Object.freeze({
  NORMAL: path.resolve(__dirname, '..', 'static', 'fonts', 'liberation', 'normal.ttf'),
  BOLD: path.resolve(__dirname, '..', 'static', 'fonts', 'liberation', 'bold.ttf'),
})

const getVatTaxes = (products) => {
  const productsWithTax = products.filter((product) => Number.isFinite(product.tax) && product.tax > 0)

  return productsWithTax.reduce((acc, curr) => {
    const taxAmount = roundTo(curr.gross - curr.net, 2)

    if (acc[curr.tax]) {
      acc[curr.tax] += taxAmount
    } else {
      acc[curr.tax] = taxAmount
    }

    return acc
  }, {})
}

const generateTableRow = (
  doc,
  y,
  item,
  quantity,
  unitCost,
  discount,
  lineTotal,
) => {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(quantity, 250, y, { width: 90, align: 'center' })
    .text(unitCost, 300, y, { width: 90, align: 'right' })
    .text(discount, 380, y, { width: 90, align: 'right' })
    .text(lineTotal, 0, y, { align: 'right' })
}

const generateHr = (doc, y, fromX = 50, toX = 580) => {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(fromX, y)
    .lineTo(toX, y)
    .stroke()
}

const generateHeader = (doc, invoice) => {
  doc
    .fontSize(12)
    .font(FONTS.NORMAL)
    .text(invoice.sender.company, 200, 50, { align: 'right' })
    .fontSize(10)
    .text(invoice.sender.address, 200, 65, { align: 'right' })
    .text(
      [invoice.sender.zip, invoice.sender.city, invoice.sender.country]
        .filter(Boolean)
        .join(', '),
      200,
      80,
      { align: 'right' },
    )
    .text(`${invoice.sender.vatId}`, 200, 95, { align: 'right' })
    .moveDown()
}

const generateCustomerInformation = (doc, invoice, i18n) => {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text(invoice.documentTitle, 50, 160)

  generateHr(doc, 185)

  const customerInformationTop = 200

  doc
    .fontSize(10)
    .text(i18n('invoices.invoiceNumber'), 50, customerInformationTop)
    .font(FONTS.BOLD)
    .text(invoice.invoiceNumber, 150, customerInformationTop)
    .font(FONTS.NORMAL)
    // eslint-disable-next-line no-underscore-dangle
    .text(i18n('invoices.invoiceDate'), 50, customerInformationTop + 15)
    .text(invoice.invoiceDate, 150, customerInformationTop + 15)

    .font(FONTS.BOLD)
    .text(invoice.client.company, 300, customerInformationTop)
    .font(FONTS.NORMAL)
    .text(invoice.client.address, 300, customerInformationTop + 15)
    .text(
      [invoice.client.zip, invoice.client.city, invoice.client.country]
        .filter(Boolean)
        .join(', '),
      300,
      customerInformationTop + 30,
    )
    .text(invoice.client.vatId, 300, customerInformationTop + 45)
    .moveDown()

  generateHr(doc, 267)
}

const generateInvoiceTable = (doc, invoice, i18n) => {
  const invoiceTableTop = 330

  doc.font(FONTS.BOLD)
  generateTableRow(
    doc,
    invoiceTableTop,
    i18n('invoices.products'),
    i18n('invoices.quantity'),
    i18n('invoices.price'),
    i18n('invoices.discount'),
    i18n('invoices.total'),
  )
  generateHr(doc, invoiceTableTop + 20)
  doc.font(FONTS.NORMAL)

  invoice.products.forEach((item, i) => {
    const position = invoiceTableTop + (i + 1) * 30
    generateTableRow(
      doc,
      position,
      item.name,
      item.quantity,
      currencyFormatter.format(roundTo(item.price, 2), { locale: invoice.locale, code: invoice.currency }),
      currencyFormatter.format(roundTo(item.discount, 2), { locale: invoice.locale, code: invoice.currency }),
      currencyFormatter.format(roundTo(item.net, 2), { locale: invoice.locale, code: invoice.currency }),
    )

    generateHr(doc, position + 20)
  })

  const subtotalPosition = invoiceTableTop + (invoice.products.length + 1) * 30
  generateTableRow(
    doc,
    subtotalPosition,
    '',
    '',
    '',
    i18n('invoices.subtotal'),
    currencyFormatter.format(roundTo(invoice.subtotalAmount, 2), { locale: invoice.locale, code: invoice.currency }),
  )

  let vatPosition = subtotalPosition

  Object.entries(getVatTaxes(invoice.products))
    .forEach(([vat, amount], i) => {
      vatPosition = subtotalPosition + (20 * (i + 1))
      generateTableRow(
        doc,
        vatPosition,
        '',
        '',
        '',
        `${invoice.taxNotation} ${vat}%`,
        currencyFormatter.format(roundTo(amount, 2), { locale: invoice.locale, code: invoice.currency }),
      )
    })

  const duePosition = vatPosition + 25
  doc.font(FONTS.BOLD)
  generateTableRow(
    doc,
    duePosition,
    '',
    '',
    '',
    i18n('invoices.total'),
    currencyFormatter.format(roundTo(invoice.totalAmount, 2), { locale: invoice.locale, code: invoice.currency }),
  )
  doc.font(FONTS.NORMAL)

  doc
    .fontSize(10)
    .text(
      invoice.bottomNotice,
      50,
      duePosition + 80,
      { align: 'center', width: 500 },
    )
}

exports.generatePdf = (invoice, i18n) => new Promise((resolve) => {
  const doc = new PDFDocument({
    margins: {
      bottom: 25,
      left: 35,
      right: 35,
      top: 25,
    },
  })

  generateHeader(doc, invoice)
  generateCustomerInformation(doc, invoice, i18n)
  generateInvoiceTable(doc, invoice, i18n)

  doc.end()

  const buffers = []
  doc.on('data', buffers.push.bind(buffers))
  doc.on('end', () => {
    resolve(Buffer.concat(buffers))
  })
})
