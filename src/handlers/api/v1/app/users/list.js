const { handler } = require('../../../../../services/http')
const { selectBy: selectUsersBy } = require('../../../../../models/v1/users/repositories')
const { selectBy: selectPermissionsBy } = require('../../../../../models/v1/permissions/repositories')
const { serialize } = require('../../../../../models/v1/users/serializers')

module.exports = handler(async ({ user: { id, accountId } }, res) => {
  const users = await selectUsersBy({ accountId })
    .where('id', '!=', id)

  const permissions = await selectPermissionsBy({ accountId, userId: users.map((o) => o.id) })

  const userPermissions = permissions.filter(({ permissionUserId }) => !!permissionUserId)
    .reduce((acc, curr) => ({
      ...acc,
      [curr.userId]: {
        ...(acc[curr.userId] || {}),
        [curr.name]: (curr.abilities || []),
      },
    }), {})

  const defaultPermissions = permissions.filter(({ permissionUserId }) => !permissionUserId)
    .reduce((acc, curr) => ({ ...acc, [curr.name]: (curr.abilities || []) }), {})

  const data = await Promise.all(users.map(
    (user) => serialize(user, {
      permissions: {
        ...defaultPermissions,
        ...userPermissions[user.id],
      },
    }),
  ))

  return res.json({ data })
})
