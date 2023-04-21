const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const {
  create: createFee,
  selectOneBy: selectFeeBy,
} = require('../../../../../models/v1/fees/repositories')
const {
  selectOneBy: selectDictFeeBy,
} = require('../../../../../models/v1/dict-fees/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/fees/schema')

module.exports = handler(async ({ user: { accountId }, body }, res) => {
  const payload = await validate(body, { schema: CREATE_SCHEMA })

  if (await selectFeeBy({ accountId, name: payload.name })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { name: ['unique'] },
    })
  }

  if (payload.dictFeeId) {
    if (!await selectDictFeeBy({ id: payload.dictFeeId })) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { dictFeeId: ['notExists'] },
      })
    }
  }

  const id = await createFee({ ...payload, accountId })

  return res.status(201).json({ data: { id } })
})
