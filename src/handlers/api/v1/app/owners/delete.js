const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { deleteFiles } = require('../../../../../services/s3')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/owners/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const owner = await selectOneBy({ accountId, id })

  if (!owner) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deleteBy({ accountId, id })

  /**
   * Delete owner avatar from S3
   */
  try {
    await deleteFiles([owner.avatar])
  } catch (error) {}

  return res.sendStatus(204)
})
