const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { upload } = require('../../../../../../services/s3')
const { validate } = require('../../../../../../services/validate')
const { mimeFromFile } = require('../../../../../../services/mime')
const {
  create: createFileBy,
  selectOneBy: selectFileBy,
  generateFilesPath,
} = require('../../../../../../models/v1/storage/files/repositories')
const {
  selectOneBy: selectFolderBy,
} = require('../../../../../../models/v1/storage/folders/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/storage/files/serializers')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/storage/files/schema')

module.exports = handler(async ({ files: { file }, user: { id: userId, accountId }, body }, res) => {
  /**
   * We can upload a new file only when is inside the files payload
   */
  if (!file || !file.data) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { file: ['required'] },
    })
  }

  const { name, ...payload } = await validate(body, { schema: CREATE_SCHEMA })

  /**
   * If we wanna upload file to the folder then the folder must exists.
   * Otherwise we should throw a validation error.
   */
  if (payload.folderId) {
    if (!await selectFolderBy({ accountId, id: payload.folderId })) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { folderId: ['notExists'] },
      })
    }
  }

  const s3key = generateFilesPath(file)(accountId)

  if (await selectFileBy({ accountId, path: s3key })) {
    throw createError(409, MESSAGES.ALREADY_EXISTS, {
      code: CODES.ALREADY_EXISTS,
    })
  }

  const originalFileName = name || file.name

  const { ext, mime } = await mimeFromFile(file)

  /**
   * Upload file to S3
   */
  await upload(s3key, Buffer.from(file.data, 'binary'), {
    ContentType: mime,
    Metadata: {
      'alt-name': encodeURIComponent(originalFileName),
    },
  })

  /**
   * Create row reference to the file in DB
   */
  const results = await createFileBy({
    accountId,
    userId,
    ...payload,
    ext,
    originalFileName,
    path: s3key,
    mimeType: mime,
    size: file.size,
  }).then((id) => selectFileBy({ id }))

  cache.del(`accounts.${accountId}.storage.*`)

  return res.json({ data: serialize(PERMITED_ITEM_PARAMS, results) })
})
