const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { signTokenByOwnerJwt } = require('../../../../../services/auth')
const { selectOneWithAccount, updateById, verifyPassword } = require('../../../../../models/v1/owners/repositories')

module.exports = handler(async ({ body: { email, password }, clientIp, headers }, res) => {
  const identifier = headers['x-org-id']

  const owner = await selectOneWithAccount({ email, identifier, hasPanelAccess: 1 })

  if (!owner) {
    throw createError(401, 'Invalid Credentials')
  }

  if (!await verifyPassword(owner, password)) {
    await updateById(owner.id, {
      currentSignInIp: clientIp,
      currentSignInAt: new Date(Date.now()),
      failedAttempts: owner.failedAttempts + 1,
    })

    throw createError(401, 'Invalid Credentials')
  }

  if (owner.lockedAt) {
    throw createError(403, 'Locked')
  }

  if (!owner.confirmedAt) {
    throw createError(403, 'Unconfirmed')
  }

  const data = await signTokenByOwnerJwt(owner.id, identifier)

  await updateById(owner.id, {
    currentSignInIp: clientIp,
    currentSignInAt: new Date(Date.now()),
    signInCount: owner.signInCount + 1,
    lastSignInAt: owner.currentSignInAt,
    lastSignInIp: owner.lastSignInIp,
    failedAttempts: 0,
  })

  return res.json({ data })
})
