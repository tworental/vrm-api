const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { createTransaction } = require('../../../../../../services/database')
const {
  getTreeIds,
  selectBy: selectFoldersBy,
  updateBy: updateFoldersBy,
} = require('../../../../../../models/v1/storage/folders/repositories')
const {
  updateBy: updateFilesBy,
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
  const foldersIds = await selectFoldersBy({ accountId, system: '0' })
    .then((folders) => getTreeIds(folders, ids))

  /**
   * Checked whether we have any real data to delete.
   */
  if (!foldersIds.length) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: [{ ids: 'notExists' }],
    })
  }

  /**
   * Soft deletion process
   */
  await createTransaction(async (trx) => {
    const deletedAt = new Date(Date.now())

    await updateFoldersBy(
      { accountId }, { deletedAt }, trx,
    ).whereIn('id', foldersIds)

    await updateFilesBy(
      { accountId }, { deletedAt }, trx,
    ).whereIn('folderId', foldersIds)
  })

  cache.del(`accounts.${accountId}.storage.*`)

  return res.sendStatus(204)
})
