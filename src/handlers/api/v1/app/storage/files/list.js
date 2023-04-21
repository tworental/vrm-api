const cache = require('../../../../../../services/cacheManager')
const { handler } = require('../../../../../../services/http')
const { selectBy: selectFilesBy } = require('../../../../../../models/v1/storage/files/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/storage/files/serializers')

module.exports = handler(async ({ user: { accountId }, query: { deleted = '0' } }, res) => {
  const data = await cache.wrap(cache.key(cache.KEY_DEFS.STORAGE_FILES_LIST, accountId, { deleted }), () => (
    selectFilesBy({ accountId, __deleted: deleted })
      .then((files) => files.map((item) => serialize(PERMITED_COLLECTION_PARAMS, item)))
  ))

  return res.json({ data })
})
