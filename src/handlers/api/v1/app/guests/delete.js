const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/guests/repositories')
const { selectOneBy: selectBookingGuestBy } = require('../../../../../models/v1/booking-guests/repositories')
const { deleteMailchimpGuest } = require('../../../../../models/v1/integration-accounts/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const guest = await selectOneBy({ accountId, id })

  if (!guest) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (await selectBookingGuestBy({ guestId: id })) {
    throw createError(422, MESSAGES.BOOKINGS_ATTACHED, {
      code: CODES.BOOKINGS_ATTACHED,
    })
  }

  if (guest.mailchimpId) {
    await deleteMailchimpGuest(accountId)(guest.mailchimpId)
  }

  await deleteBy({ id })

  return res.sendStatus(204)
})
