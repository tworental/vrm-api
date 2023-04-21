const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectWebsitePageBy } = require('../../../../../../models/v1/website-pages/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/website-pages/serializers')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../models/v1/websites/repositories')

module.exports = handler(async ({ user: { accountId }, params: { websiteId, id } }, res) => {
  if (!await selectWebsiteBy({ id: websiteId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await selectWebsitePageBy({ id, websiteId })
    .then((results) => serialize(PERMITED_ITEM_PARAMS, results))

  if (!data) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  return res.json({ data })
})
