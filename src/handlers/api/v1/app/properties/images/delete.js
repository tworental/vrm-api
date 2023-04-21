const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { deleteFiles } = require('../../../../../../services/s3')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectProperty,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectPropertyImage,
  deleteBy: deletePropertyImage,
  shiftImagePositions,
} = require('../../../../../../models/v1/property-images/repositories')
const {
  selectOneBy: selectStorageFile,
  deleteBy: deleteStorageFile,
} = require('../../../../../../models/v1/storage/files/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id, propertyId } }, res) => {
  const property = await selectProperty({ id: propertyId, accountId })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const propertyImage = await selectPropertyImage({ id, propertyId })

  if (!propertyImage) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await createTransaction(async (trx) => {
    const storageFile = await selectStorageFile({ id: propertyImage.storageFileId, accountId }, trx)

    if (storageFile) {
      try {
        await deleteFiles([storageFile.path])
      } catch (error) {}

      await deleteStorageFile({ id: propertyImage.storageFileId, accountId }, trx)
    }

    await deletePropertyImage({ id, propertyId }, trx)
    await shiftImagePositions(
      propertyImage.position + 1,
      propertyId,
      propertyImage.propertyUnitTypeId,
      propertyImage.propertyUnitTypeUnitId,
      trx,
    )
  })

  cache.del(`accounts.${accountId}.properties.*`)

  return res.sendStatus(204)
})
