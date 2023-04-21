const createError = require('../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const {
  selectOneWithAccount,
  generatePassword,
  updateById,
} = require('../../../../../../models/v1/owners/repositories')
const {
  checkToken,
  deleteBy: deleteTokenBy,
} = require('../../../../../../models/v1/owner-tokens/repositories')
const { TOKEN_TYPES } = require('../../../../../../models/v1/owner-tokens/constants')

module.exports = handler(async ({ query: { token, email }, body, headers }, res) => {
  const identifier = headers['x-org-id']
  const { password } = body

  const owner = await selectOneWithAccount({ email, identifier })

  if (!owner) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { token: ['invalid'] },
    })
  }

  const ownerToken = await checkToken(owner.id, token, TOKEN_TYPES.RESET)

  if (!ownerToken) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { token: ['invalid'] },
    })
  }

  const encryptedPassword = await generatePassword(password)

  await updateById(owner.id, { encryptedPassword })

  await deleteTokenBy({ ownerId: owner.id, type: TOKEN_TYPES.RESET })

  return res.sendStatus(204)
})
