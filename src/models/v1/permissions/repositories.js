const { queryBuilder, raw } = require('../../../services/database')

const { TABLE_NAME } = require('./constants')

exports.selectBy = ({ accountId, userId }) => queryBuilder(TABLE_NAME)
  .select(
    `${TABLE_NAME}.id`,
    raw('permission_users.id AS permission_user_id'),
    'permission_users.user_id',
    'name',
    'permission_users.abilities',
    'allow_read',
    'allow_write',
    'allow_delete',
  )
  .leftJoin(
    queryBuilder('permission_users')
      .where({ accountId })
      .whereIn('userId', [userId].flat())
      .as('permission_users'),
    'permissions.id',
    'permission_users.permission_id',
  )
