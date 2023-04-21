const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { selectOneBy, create } = require('../../../../../../models/v1/storage/folders/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/storage/folders/serializers')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/storage/folders/schema')

module.exports = handler(async ({ user: { id: userId, accountId }, body }, res) => {
  const payload = await validate(body, { schema: CREATE_SCHEMA })

  /**
   * When folderId is in the payload then we check whether the directory exists or not.
   * If yes then we throw an error.
   */
  if (payload.folderId && !await selectOneBy({ id: payload.folderId })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { folderId: ['notExists'] },
    })
  }

  /**
   * Create directory for specific currenct account by logged User
   * and return serialized results.
   */
  const data = await create({ ...payload, accountId, userId })
    .then((id) => selectOneBy({ id }))
    .then((results) => serialize(PERMITED_ITEM_PARAMS, results))

  cache.del(`accounts.${accountId}.storage.*`)

  return res.json({ data })
})
