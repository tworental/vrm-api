const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { compare, hash } = require('bcryptjs')

const {
  raw, insert, update, select, selectOne,
} = require('../../../services/database')

const { TABLE_NAME, AVATARS_S3_DIR } = require('./constants')

exports.generateAvatarPath = (accountId, userId, file) => (
  `${accountId}/${AVATARS_S3_DIR}/${userId}/${uuidv4()}${path.extname(file.name)}`
)

exports.create = async (data, trx) => {
  const { password, ...payload } = data

  const encryptedPassword = await exports.generatePassword(password)

  return insert(TABLE_NAME, {
    ...payload,
    encryptedPassword,
  }, trx)
}

exports.updateBy = async (condition, data, trx) => {
  const { password, ...payload } = data

  if (password) {
    payload.encryptedPassword = await exports.generatePassword(password)
  }

  return update(TABLE_NAME, payload, condition, trx)
    .whereNull(`${TABLE_NAME}.deletedAt`)
}

exports.updateById = (id, data, trx) => exports.updateBy({ id }, data, trx)

exports.selectOneBy = (condition, trx) => selectOne(TABLE_NAME, condition, trx)
  .select(raw('TRIM(CONCAT(IFNULL(first_name, ""), " ", IFNULL(last_name, ""))) AS full_name'))
  .whereNull(`${TABLE_NAME}.deletedAt`)

exports.selectBy = (condition, trx) => select(TABLE_NAME, condition, trx)
  .whereNull(`${TABLE_NAME}.deletedAt`)

exports.deleteBy = (condition, trx) => update(TABLE_NAME, { deletedAt: new Date(Date.now()) }, condition, trx)
  .whereNull(`${TABLE_NAME}.deletedAt`)

exports.selectOneWithAccount = (condition, trx) => exports.selectOneBy(condition, trx)
  .join('accounts', 'accounts.id', '=', `${TABLE_NAME}.account_id`)
  .whereNull('accounts.deletedAt')

exports.verifyPassword = (user, password) => compare(password, user.encryptedPassword)

exports.generatePassword = (password) => hash(password, 12)
