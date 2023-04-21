const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const {
  updateBy: updateFeeBy,
  selectOneBy: selectFeeBy,
} = require('../../../../../models/v1/fees/repositories')
const {
  selectOneBy: selectDictFeeBy,
} = require('../../../../../models/v1/dict-fees/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/fees/schema')

module.exports = handler(async ({ user: { accountId }, params: { id }, body }, res) => {
  const payload = await validate(body, { schema: UPDATE_SCHEMA })

  if (!await selectFeeBy({ accountId, id })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (payload.name) {
    if (await selectFeeBy({ accountId, name: payload.name }).where('id', '!=', id)) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { name: ['unique'] },
      })
    }
  }

  if (payload.dictFeeId) {
    if (!await selectDictFeeBy({ id: payload.dictFeeId })) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { dictFeeId: ['notExists'] },
      })
    }
  }

  await updateFeeBy({ id }, payload)

  return res.sendStatus(200)
})
