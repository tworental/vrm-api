const createError = require('../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { translate } = require('../../../../../services/translate')
const { TRANSLATE_SCHEMA } = require('../../../../../models/v1/languages/schema')

module.exports = handler(async ({ body }, res) => {
  const { text, to } = await validate(body, { schema: TRANSLATE_SCHEMA })

  try {
    const data = await translate(text, to)

    return res.json({ data })
  } catch (error) {
    if (error.errors) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { to: [error.errors[0].reason] },
      })
    }

    throw createError(400, error.message)
  }
})
