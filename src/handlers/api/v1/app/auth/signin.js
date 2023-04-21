const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { signTokenByUserJwt } = require('../../../../../services/auth')
const { selectOneWithAccount, updateById, verifyPassword } = require('../../../../../models/v1/users/repositories')

module.exports = handler(async ({ body: { email, password }, clientIp, headers }, res) => {
  const identifier = headers['x-org-id']

  const user = await selectOneWithAccount({ email, identifier })

  if (!user) {
    throw createError(401, MESSAGES.AUTH_INVALID_CREDENTIALS, { code: CODES.AUTH_INVALID_CREDENTIALS })
  }

  if (!await verifyPassword(user, password)) {
    await updateById(user.id, {
      currentSignInIp: clientIp,
      currentSignInAt: new Date(Date.now()),
      failedAttempts: user.failedAttempts + 1,
    })

    throw createError(401, MESSAGES.AUTH_INVALID_CREDENTIALS, { code: CODES.AUTH_INVALID_CREDENTIALS })
  }

  if (user.lockedAt) {
    throw createError(403, MESSAGES.ACCOUNT_LOCKED, { code: CODES.ACCOUNT_LOCKED })
  }
  if (!user.confirmedAt) {
    throw createError(403, MESSAGES.ACCOUNT_UNCONFIRMED, { code: CODES.ACCOUNT_UNCONFIRMED })
  }

  const data = await signTokenByUserJwt(user.id, identifier)

  await updateById(user.id, {
    currentSignInIp: clientIp,
    currentSignInAt: new Date(Date.now()),
    signInCount: user.signInCount + 1,
    lastSignInAt: user.currentSignInAt,
    lastSignInIp: user.lastSignInIp,
    failedAttempts: 0,
  })

  return res.json({ data })
})
