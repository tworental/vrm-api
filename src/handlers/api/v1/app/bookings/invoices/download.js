const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { getSignedUrl } = require('../../../../../../services/s3')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const {
  generateInvoice: download,
} = require('../../../../../../models/v1/bookings/repositories')
const {
  selectOneBy: selectBookingInvoice,
} = require('../../../../../../models/v1/booking-invoices/repositories')
const {
  selectOneBy: selectDocumentInvoice,
} = require('../../../../../../models/v1/documents/invoices/repositories')

const { bookingDetails } = require('../../../../../../models/v1/bookings/repositories')

module.exports = handler(async ({ user: { accountId }, params: { bookingId } }, res) => {
  const data = await cache.wrap(cache.key(cache.KEY_DEFS.BOOKING_DETAILS, accountId, bookingId), () => (
    bookingDetails({ id: bookingId, accountId })
  ))

  if (!data) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const bookingInvoice = await selectBookingInvoice({ bookingId })
  let documentsInvoiceId

  if (!bookingInvoice) {
    await download(data)
    const invoice = await selectBookingInvoice({ bookingId })

    documentsInvoiceId = invoice.documentsInvoiceId
  } else {
    documentsInvoiceId = bookingInvoice.documentsInvoiceId
  }

  const documentInvoice = await selectDocumentInvoice({ id: documentsInvoiceId })
  const url = await getSignedUrl(documentInvoice.s3InvoicePath)

  return res.redirect(url)
})
