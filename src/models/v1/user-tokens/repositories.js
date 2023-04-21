const crypto = require('crypto')

const { select, insert, remove } = require('../../../services/database')
const { TABLE_NAME, TOKEN_EXPIRES_TIME } = require('./constants')

exports.selectLastBy = (data, trx) => select(TABLE_NAME, data, trx)
  .whereRaw('expires_at >= NOW()')
  .orderBy('id', 'desc')
  .first()

exports.create = (data, trx) => insert(TABLE_NAME, data, trx)

exports.deleteBy = (conditions, trx) => remove(TABLE_NAME, conditions, trx)

exports.createToken = async (userId, value, type, trx) => {
  const token = crypto.randomBytes(20).toString('hex')
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRES_TIME)

  await insert(TABLE_NAME, {
    userId,
    type,
    token,
    value,
    expiresAt,
  }, trx)

  return token
}

exports.checkToken = (userId, token, type) => select(TABLE_NAME, { userId, type, token })
  .whereRaw('expires_at >= NOW()')
  .orderBy('id', 'desc')
  .first()
