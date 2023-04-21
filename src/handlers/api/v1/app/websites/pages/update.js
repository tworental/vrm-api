const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const {
  updateBy: updateWebsitePageBy,
  selectOneBy: selectWebsitePageBy,
} = require('../../../../../../models/v1/website-pages/repositories')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../models/v1/websites/repositories')
const {
  create: createPageTag,
  deleteBy: deletePageTagBy,
} = require('../../../../../../models/v1/website-page-tags/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/website-pages/schema')

module.exports = handler(async ({ user: { accountId }, params: { websiteId, id }, body }, res) => {
  const { name, tags } = await validate(body, { schema: UPDATE_SCHEMA })

  if (!await selectWebsiteBy({ id: websiteId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await selectWebsitePageBy({ id, websiteId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (name) {
    if (await selectWebsitePageBy({ websiteId, name }).where('id', '!=', id)) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { name: ['unique'] },
      })
    }
  }

  await createTransaction(async (trx) => {
    await updateWebsitePageBy({ id }, { name }, trx)

    await deletePageTagBy({ websitePageId: id }, trx)

    if (tags) {
      await Promise.all(tags.map((tag) => createPageTag({ websitePageId: id, tag }, trx)))
    }
  })

  return res.sendStatus(200)
})
