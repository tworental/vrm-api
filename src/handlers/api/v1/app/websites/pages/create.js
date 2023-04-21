const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const {
  create: createWebsitePageBy,
  selectOneBy: selectWebsitePageBy,
} = require('../../../../../../models/v1/website-pages/repositories')
const {
  create: createWebsitePageTag,
} = require('../../../../../../models/v1/website-page-tags/repositories')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../models/v1/websites/repositories')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/website-pages/schema')

module.exports = handler(async ({ user: { accountId }, params: { websiteId }, body }, res) => {
  const { name, tags } = await validate(body, { schema: CREATE_SCHEMA })

  if (!await selectWebsiteBy({ id: websiteId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (await selectWebsitePageBy({ websiteId, name })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { name: ['unique'] },
    })
  }

  const id = await createTransaction(async (trx) => {
    const websitePageId = await createWebsitePageBy({ websiteId, name }, trx)

    if (tags) {
      await Promise.all(tags.map((tag) => createWebsitePageTag({ websitePageId, tag }, trx)))
    }

    return websitePageId
  })

  return res.status(201).json({ data: { id } })
})
