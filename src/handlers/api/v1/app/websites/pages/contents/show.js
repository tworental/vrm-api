const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../../models/v1/website-page-contents/serializers')
const {
  selectOneBy: selectWebsitePageContentBy,
} = require('../../../../../../../models/v1/website-page-contents/repositories')
const {
  selectOneBy: selectWebsitePageBy,
} = require('../../../../../../../models/v1/website-pages/repositories')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../../models/v1/websites/repositories')

module.exports = handler(async ({ user: { accountId }, params: { websiteId, websitePageId, id } }, res) => {
  if (!await selectWebsiteBy({ id: websiteId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await selectWebsitePageBy({ id: websitePageId, websiteId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await selectWebsitePageContentBy({ id, websitePageId })
    .then((results) => serialize(PERMITED_ITEM_PARAMS, results))

  if (!data) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  return res.json({ data })
})
