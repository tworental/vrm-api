const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/taxes/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const tax = await selectOneBy({ accountId, id })

  if (!tax) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await deleteBy({ id: tax.id })

  return res.sendStatus(204)
})
