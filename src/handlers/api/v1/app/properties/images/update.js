const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectProperty,
  updateCompletenessStatus,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectPropertyImage,
  updateBy: updatePropertyImages,
} = require('../../../../../../models/v1/property-images/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/property-images/schema')

module.exports = handler(async ({ body, user: { accountId }, params: { id, propertyId } }, res) => {
  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  const property = await selectProperty({ id: propertyId, accountId })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const propertyImage = await selectPropertyImage({ id, propertyId })

  if (!propertyImage) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await createTransaction(async (trx) => {
    if (payload.main) {
      await updatePropertyImages({ propertyId }, { main: 0 }, trx)
    }

    await updatePropertyImages({ id, propertyId }, payload, trx)
  })

  await updateCompletenessStatus(propertyId)

  cache.del(`accounts.${accountId}.properties.*`)

  return res.sendStatus(204)
})
