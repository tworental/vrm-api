const { handler } = require('../../../../../../../services/http')
const createError = require('../../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../../services/errorCodes')
const cache = require('../../../../../../../services/cacheManager')
const {
  selectOneBy: selectUserBy,
  updateById: updateUserById,
} = require('../../../../../../../models/v1/users/repositories')

module.exports = handler(async ({ headers, user: { id: userId, accountId } }, res) => {
  const identifier = headers['x-org-id']

  const user = await selectUserBy({ id: userId, accountId })

  if (!user) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  await updateUserById(user.id, {
    oauth2GoogleId: null,
  })

  cache.del([
    `accounts.${accountId}.*`,
    `accounts.${identifier}.*`,
  ])

  return res.sendStatus(204)
})
