const path = require('path')
const PDFDocument = require('pdfkit')
const roundTo = require('round-to')
const currencyFormatter = require('currency-formatter')

const dayjs = require('./dayjs')

const FONTS = Object.freeze({
  NORMAL: path.resolve(__dirname, '..', 'static', 'fonts', 'liberation', 'normal.ttf'),
  BOLD: path.resolve(__dirname, '..', 'static', 'fonts', 'liberation', 'bold.ttf'),
})

const generateTableRow = (
  doc,
  y,
  item,
  dateArrival,
  dateDeparture,
  nights,
  priceNightly,
  totalAmount,
  chargedAmount,
  dueAmount,
) => {
  doc
    .fontSize(10)
    .text(item, 40, y)
    .text(dateArrival, 170, y, { width: 120, align: 'center' })
    .text(dateDeparture, 260, y, { width: 120, align: 'center' })
    .text(nights, 320, y, { width: 90, align: 'right' })
    .text(priceNightly, 400, y, { width: 90, align: 'right' })
    .text(totalAmount, 480, y, { width: 90, align: 'right' })
    .text(chargedAmount, 570, y, { width: 90, align: 'right' })
    .text(dueAmount, 640, y, { width: 90, align: 'right' })
}

const generateHr = (doc, y, fromX = 40, toX = 735) => {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(fromX, y)
    .lineTo(toX, y)
    .stroke()
}

const generateHeader = (doc, report) => {
  const from = dayjs(report.date).startOf('month').format('YYYY-MM-DD')
  const to = dayjs(report.date).endOf('month').format('YYYY-MM-DD')

  doc
    .font(FONTS.BOLD)
    .fontSize(20)
    .moveDown()
    .text((report.name))
    .font(FONTS.NORMAL)
    .fontSize(10)
    .text(`${from} - ${to}`)
}

const generateReportTable = (doc, report, reportItems, i18n) => {
  const reportTableTop = 120
  const rowsLimit = 14

  doc.font(FONTS.BOLD)

  generateTableRow(
    doc,
    reportTableTop,
    i18n('owners.reports.unit'),
    i18n('owners.reports.dateArrival'),
    i18n('owners.reports.dateDeparture'),
    i18n('owners.reports.nights'),
    i18n('owners.reports.priceNightly'),
    i18n('owners.reports.totalAmount'),
    i18n('owners.reports.chargedAmount'),
    i18n('owners.reports.dueAmount'),
  )
  generateHr(doc, reportTableTop + 20)

  doc.font(FONTS.NORMAL)

  reportItems.forEach((item, i) => {
    const position = (i < rowsLimit ? reportTableTop : 50) + ((i % (rowsLimit)) + 1) * 30

    if (i % rowsLimit === 0 && i > 0) {
      doc.addPage()
    }

    generateTableRow(
      doc,
      position,
      item.name,
      dayjs(item.dateArrival).format('YYYY-MM-DD'),
      dayjs(item.dateDeparture).format('YYYY-MM-DD'),
      item.totalNights,
      currencyFormatter.format(
        roundTo(item.priceNightlyExchanged, 2), { locale: report.locale, code: report.currency },
      ),
      currencyFormatter.format(
        roundTo(item.totalAmountExchanged, 2), { locale: report.locale, code: report.currency },
      ),
      currencyFormatter.format(
        roundTo(item.chargedAmountExchanged, 2), { locale: report.locale, code: report.currency },
      ),
      currencyFormatter.format(
        roundTo(item.dueExchanged, 2), { locale: report.locale, code: report.currency },
      ),
    )

    generateHr(doc, position + 20)
  })
}

const generateNumeration = (doc) => {
  const pages = doc.bufferedPageRange()
  for (let i = 0; i < pages.count; i += 1) {
    doc.switchToPage(i)

    // Footer: Add page number
    const oldBottomMargin = doc.page.margins.bottom
    // eslint-disable-next-line no-param-reassign
    doc.page.margins.bottom = 0
    doc
      .text(
        `Page: ${i + 1} of ${pages.count}`,
        0,
        doc.page.height - oldBottomMargin,
        { align: 'center' },
      )
    // eslint-disable-next-line no-param-reassign
    doc.page.margins.bottom = oldBottomMargin
  }
}

exports.generatePdf = (report, reportItems, i18n) => new Promise((resolve) => {
  const doc = new PDFDocument({
    margins: {
      bottom: 25,
      left: 35,
      right: 35,
      top: 25,
    },
    layout: 'landscape',
    bufferPages: true,
  })

  generateHeader(doc, report)
  generateReportTable(doc, report, reportItems, i18n)
  generateNumeration(doc)

  doc.end()

  const buffers = []
  doc.on('data', buffers.push.bind(buffers))
  doc.on('end', () => {
    resolve(Buffer.concat(buffers))
  })
})
