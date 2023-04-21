const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { updateBy } = require('../../../../../../models/v1/storage/files/repositories')

module.exports = handler(async ({ user: { accountId }, query: { ids } }, res) => {
  /**
   * We can delete files only when we pass query.ids array with ids of the files.
   */
  if (!Array.isArray(ids) || !ids.length) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: [{ ids: 'required' }],
    })
  }

  await updateBy(
    { accountId },
    { deletedAt: new Date(Date.now()) },
  ).whereIn('id', ids)

  cache.del(`accounts.${accountId}.storage.*`)

  return res.sendStatus(204)
})
