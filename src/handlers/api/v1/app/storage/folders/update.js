const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { selectOneBy, updateBy } = require('../../../../../../models/v1/storage/folders/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/storage/folders/schema')

module.exports = handler(async ({ user: { accountId }, params: { id }, body }, res) => {
  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  const folder = await selectOneBy({ id, accountId })

  if (!folder) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (folder.system) {
    throw createError(400, 'You can not update a "system" directory')
  }

  if (payload.folderId) {
    const parentFolder = await selectOneBy({ id: payload.folderId, accountId })
      .whereRaw('folder_id <=> ?', [payload.folderId])

    if (!parentFolder) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { folderId: ['notExists'] },
      })
    }
  }

  await updateBy({ id, accountId }, payload)

  cache.del(`accounts.${accountId}.storage.*`)

  return res.sendStatus(204)
})
