const createError = require('../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneWithAccount, updateById, generatePassword } = require('../../../../../../models/v1/users/repositories')
const { checkToken, deleteBy: deleteTokenBy } = require('../../../../../../models/v1/user-tokens/repositories')
const { TOKEN_TYPES } = require('../../../../../../models/v1/user-tokens/constants')

module.exports = handler(async ({ query: { token, email }, body, headers }, res) => {
  const identifier = headers['x-org-id']
  const { password } = body

  const user = await selectOneWithAccount({ email, identifier })

  if (!user) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { token: ['invalid'] },
    })
  }

  const userToken = await checkToken(user.id, token, TOKEN_TYPES.RESET)

  if (!userToken) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { token: ['invalid'] },
    })
  }

  const encryptedPassword = await generatePassword(password)

  await updateById(user.id, { encryptedPassword })

  await deleteTokenBy({ userId: user.id, type: TOKEN_TYPES.RESET })

  return res.sendStatus(204)
})
