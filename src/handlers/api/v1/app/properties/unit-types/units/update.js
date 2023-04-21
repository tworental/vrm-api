const cache = require('../../../../../../../services/cacheManager')
const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const { validate } = require('../../../../../../../services/validate')
const { createTransaction } = require('../../../../../../../services/database')
const {
  selectOneBy: selectPropertyBy,
  updateCompletenessStatus,
} = require('../../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectUnitBy,
  updateBy: updateUnitsBy,
} = require('../../../../../../../models/v1/units/repositories')
const { selectOneBy: selectUnitTypeBy } = require('../../../../../../../models/v1/unit-types/repositories')
const { upsertBy: upsertArrangementsBy } = require('../../../../../../../models/v1/unit-arrangements/repositories')
const { upsertBy: upsertAmenitiesBy } = require('../../../../../../../models/v1/unit-amenities/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../../models/v1/units/schema')

module.exports = handler(async ({
  body, user: { accountId }, params: { propertyId, propertyUnitTypeId, id },
}, res) => {
  const property = await selectPropertyBy({ id: propertyId, accountId })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const unitType = await selectUnitTypeBy({ id: propertyUnitTypeId, propertyId })

  if (!unitType) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const unit = await selectUnitBy({ id, propertyId, propertyUnitTypeId })

  if (!unit) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const { amenities, arrangements, ...payload } = await validate(body, { schema: UPDATE_SCHEMA })

  await createTransaction(async (trx) => {
    await upsertAmenitiesBy(id, amenities, trx)
    await upsertArrangementsBy(id, arrangements, trx)
    await updateUnitsBy({ id }, payload, trx)
  })

  await updateCompletenessStatus(propertyId)

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.sendStatus(204)
})
