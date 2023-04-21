const invNum = require('invoice-number')

const dayjs = require('./dayjs')

exports.generate = (lastInvoiceNo) => invNum.InvoiceNumber.next(lastInvoiceNo)

exports.populatePattern = (pattern, startFrom = '01') => {
  const date = dayjs()

  return pattern
    .replace('{YYYY}', date.format('YYYY'))
    .replace('{MM}', date.format('MM'))
    .replace('{NN}', startFrom)
}
