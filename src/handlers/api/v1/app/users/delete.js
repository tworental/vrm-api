const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/users/repositories')

module.exports = handler(async ({ user: { id: currentId, accountId }, params: { id } }, res) => {
  const member = await selectOneBy({ accountId, id })

  if (!member) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (member.id === currentId) {
    throw createError(400, 'You can not delete yourself')
  }

  if (member.isAccountOwner) {
    throw createError(400, 'User who is an owner of the account can not be deleted')
  }

  await deleteBy({ id: member.id })

  return res.sendStatus(204)
})
