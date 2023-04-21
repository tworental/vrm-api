const { subscribe } = require('../services/pubsub')
const { LISTENERS, STATUSES } = require('../models/v1/bookings/constants')
const { generateInvoice } = require('../models/v1/bookings/repositories')

subscribe(LISTENERS.STATUS_CHANGED, async (_, data) => {
  switch (data.status) {
    case STATUSES.CONFIRMED: {
      try {
        await generateInvoice(data)
      } catch (err) {}
      break
    }
    default:
      break
  }
})
