const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { selectOneBy: selectUserBy } = require('../../../../../models/v1/users/repositories')
const { selectBy: selectPermissionsBy } = require('../../../../../models/v1/permissions/repositories')
const { serialize } = require('../../../../../models/v1/users/serializers')

module.exports = handler(async ({ params, user: { accountId, id } }, res) => {
  const user = await selectUserBy({ accountId, id: params.id })
    .where('id', '!=', id)

  if (!user) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const permissions = await selectPermissionsBy({ accountId, userId: user.id })
    .then((results) => results.reduce((acc, curr) => ({ ...acc, [curr.name]: (curr.abilities || []) }), {}))

  const data = await serialize(user, { permissions })

  return res.json({ data })
})
