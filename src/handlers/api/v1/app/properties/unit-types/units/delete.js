const cache = require('../../../../../../../services/cacheManager')
const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const {
  selectOneBy: selectPropertyBy,
} = require('../../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectOneUnitBy,
  deleteBy: deleteUnitsBy,
} = require('../../../../../../../models/v1/units/repositories')
const {
  selectOneBy: selectBookingBy,
} = require('../../../../../../../models/v1/bookings/repositories')
const { STATUSES } = require('../../../../../../../models/v1/bookings/constants')

module.exports = handler(async ({ user: { accountId }, params: { propertyId, propertyUnitTypeId, id } }, res) => {
  if (!await selectPropertyBy({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const unit = await selectOneUnitBy({ id, propertyId, propertyUnitTypeId })

  if (!unit) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const booking = await selectBookingBy({ accountId, propertyUnitTypeUnitId: id })
    .whereIn('status', [STATUSES.TENTATIVE, STATUSES.CONFIRMED])
    .whereRaw('date_arrival >= NOW()')

  if (booking) {
    throw createError(422, MESSAGES.BOOKINGS_ATTACHED, {
      code: CODES.BOOKINGS_ATTACHED,
    })
  }

  await deleteUnitsBy({ id, propertyId, propertyUnitTypeId })

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
