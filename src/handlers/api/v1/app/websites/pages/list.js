const { handler } = require('../../../../../../services/http')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { selectBy: selectWebsitePageBy } = require('../../../../../../models/v1/website-pages/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/website-pages/serializers')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../models/v1/websites/repositories')

module.exports = handler(async ({ user: { accountId }, params: { websiteId } }, res) => {
  if (!await selectWebsiteBy({ id: websiteId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await selectWebsitePageBy({ websiteId })
    .then((results) => serialize(PERMITED_COLLECTION_PARAMS, results))

  return res.json({ data })
})
