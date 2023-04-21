const cache = require('../../../../../services/cacheManager')
const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { createTransaction } = require('../../../../../services/database')
const {
  selectOneBy: selectPropertyBy,
  deleteBy: deletePropertiesBy,
} = require('../../../../../models/v1/properties/repositories')
const {
  deleteBy: deleteUnitTypesBy,
} = require('../../../../../models/v1/unit-types/repositories')
const {
  deleteBy: deleteUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const {
  selectOneBy: selectBookingBy,
} = require('../../../../../models/v1/bookings/repositories')
const { STATUSES } = require('../../../../../models/v1/bookings/constants')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const results = await selectPropertyBy({ id, accountId })

  if (!results) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const booking = await selectBookingBy({ accountId, propertyId: id })
    .whereIn('status', [STATUSES.TENTATIVE, STATUSES.CONFIRMED])
    .whereRaw('date_arrival >= NOW()')

  if (booking) {
    throw createError(422, MESSAGES.BOOKINGS_ATTACHED, {
      code: CODES.BOOKINGS_ATTACHED,
    })
  }

  await createTransaction(async (trx) => {
    await deletePropertiesBy({ id }, trx)
    await deleteUnitTypesBy({ propertyId: id }, trx)
    await deleteUnitsBy({ propertyId: id }, trx)
  })

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
