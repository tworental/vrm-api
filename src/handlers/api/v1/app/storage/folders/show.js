const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy } = require('../../../../../../models/v1/storage/folders/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/storage/folders/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const folder = await cache.wrap(cache.key(cache.KEY_DEFS.STORAGE_FOLDER_DETAILS, accountId, id), () => (
    selectOneBy({ id, accountId })
  ))

  if (!folder) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  return res.json({
    data: serialize(PERMITED_ITEM_PARAMS, folder),
  })
})
