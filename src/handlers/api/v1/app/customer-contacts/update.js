const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const {
  selectOneBy,
  updateBy,
  uploadFile,
} = require('../../../../../models/v1/customer-contacts/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/customer-contacts/schema')

module.exports = handler(async ({
  body, files, user: { accountId }, params: { id },
}, res) => {
  const contact = await selectOneBy({ accountId, id })

  if (!contact) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  if (await selectOneBy({ accountId, email: payload.email }).where('id', '!=', id)) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { email: ['exists'] },
    })
  }

  await createTransaction(async (trx) => {
    if (files.avatar) {
      try {
        const { url } = await uploadFile(files.avatar, contact.avatar, { acl: 'public-read' })(accountId)

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

    return updateBy({ accountId, id }, { ...payload, accountId }, trx)
  })

  return res.sendStatus(204)
})
