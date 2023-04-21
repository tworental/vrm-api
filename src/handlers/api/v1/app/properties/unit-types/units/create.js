const cache = require('../../../../../../../services/cacheManager')
const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const { validate } = require('../../../../../../../services/validate')
const {
  selectOneBy: selectPropertyBy,
  updateCompletenessStatus,
} = require('../../../../../../../models/v1/properties/repositories')
const { selectOneBy: selectOneUnitTypeBy } = require('../../../../../../../models/v1/unit-types/repositories')
const { create: createUnit } = require('../../../../../../../models/v1/units/repositories')
const { CREATE_SCHEMA } = require('../../../../../../../models/v1/units/schema')

module.exports = handler(async ({
  body, account: { id: accountId }, params: { propertyId, propertyUnitTypeId },
}, res) => {
  const payload = await validate(body, { schema: CREATE_SCHEMA })

  const property = await selectPropertyBy({ id: propertyId, accountId })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const unitType = await selectOneUnitTypeBy({ id: propertyUnitTypeId, propertyId })

  if (!unitType) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const id = await createUnit({
    area: unitType.area,
    areaUnit: unitType.areaUnit,
    ...payload,
    propertyId,
    propertyUnitTypeId,
  })

  updateCompletenessStatus(propertyId)

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.statistics.*`,
  ])

  return res.json({ data: { id } })
})
