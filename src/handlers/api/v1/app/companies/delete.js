const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/companies/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const company = await selectOneBy({ accountId, id })

  if (!company) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deleteBy({ accountId, id })

  return res.sendStatus(204)
})
