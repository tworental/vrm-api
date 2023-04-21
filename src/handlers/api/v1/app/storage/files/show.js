const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy } = require('../../../../../../models/v1/storage/files/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/storage/files/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const file = await cache.wrap(cache.key(cache.KEY_DEFS.STORAGE_FILE_DETAILS, accountId, id), () => (
    selectOneBy({ id, accountId })
  ))

  if (!file) {
    throw createError(404, MESSAGES.NOT_FOUND, {
      code: CODES.NOT_FOUND,
    })
  }

  return res.json({ data: serialize(PERMITED_ITEM_PARAMS, file) })
})
