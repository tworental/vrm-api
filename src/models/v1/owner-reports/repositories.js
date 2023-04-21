const dao = require('../../../services/dao')
const { generatePdf } = require('../../../services/report-pdf')

const { TABLE_NAME } = require('./constants')

const generateReport = async (report, items, i18n) => {
  const pdfBuffer = await generatePdf(report, items, i18n)
  // module.exports is used because of needing to use method which is located in dao result.
  const { path } = await module.exports.uploadFile({
    name: `report-${report.date}.pdf`,
    data: pdfBuffer,
  }, report.s3ReportPath)(report.accountId, report.date.substr(0, 7))

  return path
}

module.exports = dao({
  tableName: TABLE_NAME,
  storageDir: 'reports',
  methods: {
    generateReport,
  },
})
