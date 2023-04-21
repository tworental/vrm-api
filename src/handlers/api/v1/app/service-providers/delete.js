const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/service-providers/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const provider = await selectOneBy({ accountId, id })

  if (!provider) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deleteBy({ id: provider.id })

  return res.sendStatus(204)
})
