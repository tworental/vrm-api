const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectProperty,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectPropertyImage,
  updateBy: updatePropertyImages,
  storageFiles,
} = require('../../../../../../models/v1/property-images/repositories')
const { MOVE_SCHEMA } = require('../../../../../../models/v1/property-images/schema')

module.exports = handler(async ({
  body,
  user: { accountId },
  params: { id, propertyId },
  query: { propertyUnitTypeId, propertyUnitTypeUnitId },
}, res) => {
  const { newIndex, oldIndex } = await validate(body, { schema: MOVE_SCHEMA })

  const property = await selectProperty({ id: propertyId, accountId })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const propertyImage = await selectPropertyImage({ id, propertyId })

  if (!propertyImage) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const shouldIncreasePositions = oldIndex > newIndex
  let ranges

  if (shouldIncreasePositions) {
    ranges = [newIndex, oldIndex]
  } else {
    ranges = [oldIndex + 1, newIndex]
  }

  const images = await storageFiles(propertyId, propertyUnitTypeId, propertyUnitTypeUnitId)
    .whereBetween('position', ranges)

  await createTransaction(async (trx) => {
    await Promise.all(images.map(async (image) => {
      const offset = shouldIncreasePositions ? 1 : -1

      await updatePropertyImages({ id: image.id, propertyId }, { position: image.position + offset }, trx)
    }))

    await updatePropertyImages({ id, propertyId }, { position: newIndex }, trx)
  })

  cache.del(`accounts.${accountId}.properties.*`)

  return res.sendStatus(204)
})
