const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const {
  selectBy: selectWebsitePageTagBy,
} = require('../../../../../../../models/v1/website-page-tags/repositories')
const {
  PERMITED_COLLECTION_PARAMS, serialize,
} = require('../../../../../../../models/v1/website-page-tags/serializers')
const {
  selectOneBy: selectWebsitePageBy,
} = require('../../../../../../../models/v1/website-pages/repositories')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../../models/v1/websites/repositories')

module.exports = handler(async ({ user: { accountId }, params: { websiteId, websitePageId } }, res) => {
  if (!await selectWebsiteBy({ id: websiteId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await selectWebsitePageBy({ id: websitePageId, websiteId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await selectWebsitePageTagBy({ websitePageId })
    .then((results) => serialize(PERMITED_COLLECTION_PARAMS, results))

  return res.json({ data })
})
