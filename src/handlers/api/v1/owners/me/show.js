const { handler } = require('../../../../../services/http')
const { serialize } = require('../../../../../models/v1/users/serializers')

module.exports = handler(async ({ user }, res) => {
  const data = await serialize(user)

  return res.json({ data })
})
