const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const { validate } = require('../../../../../../../services/validate')
const { sanitizePayload, createTransaction } = require('../../../../../../../services/database')
const {
  create: createWebsitePageContentBy,
  deleteBy,
} = require('../../../../../../../models/v1/website-page-contents/repositories')
const {
  selectOneBy: selectWebsitePageBy,
} = require('../../../../../../../models/v1/website-pages/repositories')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../../models/v1/websites/repositories')
const { CREATE_SCHEMA } = require('../../../../../../../models/v1/website-page-contents/schema')

module.exports = handler(async ({ user: { accountId }, params: { websiteId, websitePageId }, body }, res) => {
  const payload = await validate(body, { schema: CREATE_SCHEMA })

  if (!await selectWebsiteBy({ id: websiteId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await selectWebsitePageBy({ id: websitePageId, websiteId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const id = await createTransaction(async (trx) => {
    await deleteBy({ websitePageId }, trx)

    const pageContentId = await sanitizePayload(payload,
      (result) => createWebsitePageContentBy({ websitePageId, ...result }, trx))

    return pageContentId
  })

  return res.status(201).json({ data: { id } })
})
