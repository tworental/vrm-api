const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const {
  uploadFile,
  selectOneBy,
  create,
  updateBy,
} = require('../../../../../models/v1/customer-contacts/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/customer-contacts/schema')

module.exports = handler(async ({ body, files, user: { accountId } }, res) => {
  const payload = await validate(body, { schema: CREATE_SCHEMA })

  if (await selectOneBy({ accountId, email: payload.email })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { email: ['exists'] },
    })
  }

  const id = await createTransaction(async (trx) => {
    if (files.avatar) {
      try {
        const { url } = await uploadFile(files.avatar, null, { acl: 'public-read' })(accountId)

        payload.avatar = url
      } catch (err) {
        throw createError(422, MESSAGES.UNPROCESSABLE_ENTITY, {
          code: CODES.UNPROCESSABLE_ENTITY,
        })
      }
    }

    if (payload.isDefault) {
      await updateBy({ accountId }, { isDefault: 0 }, trx)
    }

    return create({ ...payload, accountId }, trx)
  })

  return res.json({ data: { id } })
})
