const crypto = require('crypto')

const { select, insert, remove } = require('../../../services/database')
const { TABLE_NAME, TOKEN_EXPIRES_TIME } = require('./constants')

exports.deleteBy = (conditions, trx) => remove(TABLE_NAME, conditions, trx)

exports.createToken = async (ownerId, value, type, trx) => {
  const token = crypto.randomBytes(20).toString('hex')
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRES_TIME)

  await insert(TABLE_NAME, {
    ownerId,
    type,
    token,
    value,
    expiresAt,
  }, trx)

  return token
}

exports.checkToken = (ownerId, token, type) => select(TABLE_NAME, { ownerId, type, token })
  .whereRaw('expires_at >= NOW()')
  .first()
