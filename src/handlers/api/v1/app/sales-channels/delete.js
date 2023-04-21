const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/sales-channels/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const results = await selectOneBy({ accountId, id })

  if (!results) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deleteBy({ id: results.id })

  return res.sendStatus(204)
})
