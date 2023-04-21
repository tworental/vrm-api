const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { createTransaction } = require('../../../../../../services/database')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const {
  selectBy: selectUnitTypesBy,
  deleteBy: deleteUnitTypesBy,
} = require('../../../../../../models/v1/unit-types/repositories')
const {
  deleteBy: deleteUnitsBy,
} = require('../../../../../../models/v1/units/repositories')
const {
  selectOneBy: selectBookingBy,
} = require('../../../../../../models/v1/bookings/repositories')
const { STATUSES } = require('../../../../../../models/v1/bookings/constants')

module.exports = handler(async ({ user: { accountId }, params: { propertyId, id } }, res) => {
  if (!await selectPropertyBy({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const unitTypes = await selectUnitTypesBy({ propertyId })

  if (unitTypes.length <= 1) {
    throw createError(400, 'Minimum 1 UnitType must exists')
  }

  const booking = await selectBookingBy({ accountId, propertyUnitTypeId: id })
    .whereIn('status', [STATUSES.TENTATIVE, STATUSES.CONFIRMED])
    .whereRaw('date_arrival >= NOW()')

  if (booking) {
    throw createError(422, MESSAGES.BOOKINGS_ATTACHED, {
      code: CODES.BOOKINGS_ATTACHED,
    })
  }

  await deleteUnitTypesBy({ id, propertyId })

  await createTransaction(async (trx) => {
    await deleteUnitTypesBy({ id, propertyId }, trx)
    await deleteUnitsBy({ propertyId, propertyUnitTypeId: id }, trx)
  })

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
