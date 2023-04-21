const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const {
  selectOneBy: selectFileBy,
  updateBy: updateFilesBy,
} = require('../../../../../../models/v1/storage/files/repositories')
const {
  selectOneBy: selectFolderBy,
} = require('../../../../../../models/v1/storage/folders/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/storage/files/schema')

module.exports = handler(async ({ user: { accountId }, params: { id }, body }, res) => {
  const { name: originalFileName, ...payload } = await validate(body, { schema: UPDATE_SCHEMA })

  if (!await selectFileBy({ id, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (payload.folderId) {
    if (!await selectFolderBy({ accountId, id: payload.folderId })) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { folderId: ['notExists'] },
      })
    }
  }

  await updateFilesBy({ id, accountId }, { ...payload, originalFileName })

  cache.del(`accounts.${accountId}.storage.*`)

  return res.sendStatus(204)
})
