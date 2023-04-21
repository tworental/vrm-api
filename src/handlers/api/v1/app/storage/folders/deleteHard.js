const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../services/errorCodes')
const { deleteFiles } = require('../../../../../../services/s3')
const { handler } = require('../../../../../../services/http')
const {
  getTreeIds,
  selectBy: selectFoldersBy,
  deleteBy: deleteFoldersBy,
} = require('../../../../../../models/v1/storage/folders/repositories')
const {
  selectBy: selectFilesBy,
} = require('../../../../../../models/v1/storage/files/repositories')

module.exports = handler(async ({ user: { accountId }, query: { ids } }, res) => {
  /**
   * We can delete folders only when we pass query.ids array with ids of the folders.
   */
  if (!Array.isArray(ids) || !ids.length) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: [{ ids: 'required' }],
    })
  }

  /**
   * We can delete only folder which are belongs to the logged user account,
   * are not soft deleted and are not system directories and we transform to flat tree of ids.
   */
  const foldersIds = await selectFoldersBy({ accountId, system: '0', __deleted: 1 })
    .then((folders) => getTreeIds(folders, ids))

  if (!foldersIds.length) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: [{ ids: 'notExists' }],
    })
  }

  const files = await selectFilesBy({ accountId, __deleted: 1 })
    .whereIn('folderId', foldersIds)

  try {
    await deleteFiles(files.map(({ path }) => path))
  } catch (error) {}

  await deleteFoldersBy({ accountId, __deleted: 1 })
    .whereIn('id', foldersIds)

  cache.del(`accounts.${accountId}.storage.*`)

  return res.sendStatus(204)
})
