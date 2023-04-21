const { insert, update } = require('../../../services/database')
const { selectBy } = require('../permissions/repositories')

const { TABLE_NAME } = require('./constants')

exports.setPermissions = async (accountId, userId, body, trx) => {
  const permissions = await selectBy({ accountId, userId })
    .where('name', 'IN', body.map((item) => item.name))
    .then((results) => results.reduce((acc, curr) => {
      acc[curr.name] = curr
      return acc
    }, {}))

  const data = body.filter(({ name }) => (
    permissions[name] && permissions[name].id
  ))

  return Promise.all(
    data.map(async ({ name, abilities }) => {
      const { id, permissionUserId } = permissions[name]

      const payload = {
        id: permissionUserId,
        permissionId: id,
        abilities: JSON.stringify(abilities || []),
        accountId,
        userId,
      }

      if (payload.id) {
        await update(TABLE_NAME, payload, { id: payload.id }, trx)
      } else {
        await insert(TABLE_NAME, payload, trx)
      }
    }),
  )
}
