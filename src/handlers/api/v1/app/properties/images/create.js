const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { upload } = require('../../../../../../services/s3')
const { mimeFromFile } = require('../../../../../../services/mime')
const { createTransaction } = require('../../../../../../services/database')
const {
  create: createFileBy,
} = require('../../../../../../models/v1/storage/files/repositories')
const {
  upsertOneBy: upsertFolderBy,
} = require('../../../../../../models/v1/storage/folders/repositories')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const { selectOneBy: selectUnitType } = require('../../../../../../models/v1/unit-types/repositories')
const { selectOneBy: selectUnit } = require('../../../../../../models/v1/units/repositories')
const {
  create: createStorageImage,
  updateBy: updatePropertyImages,
  generateFilesPath,
} = require('../../../../../../models/v1/property-images/repositories')
const { FOLDERS } = require('../../../../../../models/v1/storage/folders/constants')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/property-images/schema')

module.exports = handler(async ({
  body,
  files: { file },
  params: { propertyId },
  user: { id: userId, accountId },
}, res) => {
  const payload = await validate({ ...body, propertyId }, { schema: CREATE_SCHEMA })

  /**
   * We can upload a new file only when is inside the files payload
   */
  if (!file || !file.data) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { image: ['required'] },
    })
  }

  const property = await selectProperty({ accountId, id: propertyId })

  if (!property) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { propertyId: ['notExists'] },
    })
  }

  if (payload.propertyUnitTypeId) {
    if (!await selectUnitType({ propertyId, id: payload.propertyUnitTypeId })) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { propertyUnitTypeId: ['notExists'] },
      })
    }
  }

  if (payload.propertyUnitTypeUnitId) {
    if (!await selectUnit({ propertyId, id: payload.propertyUnitTypeUnitId })) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { propertyUnitTypeUnitId: ['notExists'] },
      })
    }
  }

  const s3key = generateFilesPath(file)(accountId, propertyId)

  const { ext, mime } = await mimeFromFile(file)

  /**
   * Start Uploading files to S3 - these images must be public!
   */
  const { Location: publicUrl } = await upload(s3key, Buffer.from(file.data, 'binary'), {
    ContentType: mime,
    ACL: 'public-read',
    Metadata: {
      'alt-name': encodeURIComponent(file.name),
    },
  })

  const propertiesFolder = await upsertFolderBy({
    accountId, name: FOLDERS.PROPERTIES, hidden: 1,
  })

  const id = await createTransaction(async (trx) => {
    const { id: folderId } = await upsertFolderBy({
      accountId, folderId: propertiesFolder.id, name: property.name, hidden: 1,
    }, trx)

    /**
     * Create row reference to the file in DB
     */
    const storageFileId = await createFileBy({
      accountId,
      userId,
      folderId,
      ext,
      originalFileName: file.name,
      path: s3key,
      publicUrl,
      mimeType: mime,
      size: file.size,
    }, trx)

    /**
     * If we have "main" flag as a true then we must update all other to 0 in the same scope
     */
    if (payload.main) {
      await updatePropertyImages({ propertyId }, { main: 0 }, trx)
    }

    /**
     * Create storage image row
     */
    return createStorageImage({
      storageFileId, ...payload,
    }, trx)
  })

  cache.del([
    `accounts.${accountId}.properties.*`,
    `accounts.${accountId}.storage.*`,
  ])

  return res.status(201).json({
    data: { id },
  })
})
