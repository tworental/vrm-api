const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { getSignedUrl } = require('../../../../../../services/s3')
const { selectOneBy } = require('../../../../../../models/v1/storage/files/repositories')

module.exports = handler(async ({ user: { accountId }, params: { uuid } }, res) => {
  const file = await cache.wrap(cache.key(cache.KEY_DEFS.STORAGE_FILE_DETAILS, accountId, uuid), () => (
    selectOneBy({ uuid, accountId })
  ))

  if (!file) {
    throw createError(404, MESSAGES.NOT_FOUND, {
      code: CODES.NOT_FOUND,
    })
  }

  const url = await getSignedUrl(file.path)

  return res.redirect(url)
})
