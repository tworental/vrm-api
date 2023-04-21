const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { deleteFiles } = require('../../../../../services/s3')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/websites/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const website = await selectOneBy({ accountId, id })

  if (!website) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deleteBy({ id: website.id })

  /**
   * Delete owner avatar from S3
   */
  try {
    if (website.faviconUrl) {
      await deleteFiles([website.faviconUrl])
    }
  } catch (error) {}

  return res.sendStatus(204)
})
