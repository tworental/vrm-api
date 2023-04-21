const createError = require('../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneWithAccount, updateById } = require('../../../../../../models/v1/owners/repositories')
const { deleteBy: deleteTokenBy, checkToken } = require('../../../../../../models/v1/owner-tokens/repositories')
const { TOKEN_TYPES } = require('../../../../../../models/v1/owner-tokens/constants')

module.exports = handler(async ({ query: { email, token }, headers }, res) => {
  const identifier = headers['x-org-id']

  const owner = await selectOneWithAccount({ email, identifier })

  if (!owner) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { token: ['invalid'] },
    })
  }

  const ownerToken = await checkToken(owner.id, token, TOKEN_TYPES.CONFIRMATION)

  if (!ownerToken) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { token: ['invalid'] },
    })
  }

  if (!owner.confirmedAt) {
    await updateById(owner.id, {
      confirmedAt: new Date(Date.now()),
    })
  }

  await deleteTokenBy({ ownerId: owner.id, type: TOKEN_TYPES.CONFIRMATION })

  return res.sendStatus(202)
})
