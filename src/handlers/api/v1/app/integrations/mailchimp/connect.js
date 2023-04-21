const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const createError = require('../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../services/errorCodes')
const mailchimp = require('../../../../../../services/mailchimp')
const { MAILCHIMP_SCHEMA } = require('../../../../../../models/v1/integration-accounts/constants')

module.exports = handler(async ({ body: { apiKey, server } }, res) => {
  const payload = await validate({ apiKey, server }, { schema: MAILCHIMP_SCHEMA })

  try {
    await mailchimp.connect(payload)
  } catch (error) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  return res.json({ data: true })
})
