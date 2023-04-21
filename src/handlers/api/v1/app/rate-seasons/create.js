const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { create } = require('../../../../../models/v1/rate-seasons/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/rate-seasons/schema')

module.exports = handler(async ({ user: { accountId }, body }, res) => {
  const payload = await validate(body, { schema: CREATE_SCHEMA })

  const id = await create({ ...payload, accountId })

  return res.status(201).json({
    data: { id },
  })
})
