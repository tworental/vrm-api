const cache = require('../../../../../../../../services/cacheManager')
const createError = require('../../../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../../services/http')
const { selectOneWithAccount, updateById } = require('../../../../../../../../models/v1/users/repositories')
const { deleteBy: deleteTokenBy, checkToken } = require('../../../../../../../../models/v1/user-tokens/repositories')
const { TOKEN_TYPES } = require('../../../../../../../../models/v1/user-tokens/constants')

module.exports = handler(async ({ query: { email, token }, headers }, res) => {
  const identifier = headers['x-org-id']

  const user = await selectOneWithAccount({ email, identifier })

  if (!user) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { token: ['invalid'] },
    })
  }

  const userToken = await checkToken(user.id, token, TOKEN_TYPES.CONFIRMATION)

  if (!userToken) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { token: ['invalid'] },
    })
  }

  if (!user.confirmedAt) {
    await updateById(user.id, {
      confirmedAt: new Date(Date.now()),
    })
  }

  await deleteTokenBy({ userId: user.id, type: TOKEN_TYPES.CONFIRMATION })

  cache.del(`accounts.${user.accountId}.users.${user.id}`)

  return res.sendStatus(202)
})
