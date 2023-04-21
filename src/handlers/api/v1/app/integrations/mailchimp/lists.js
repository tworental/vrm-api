const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const createError = require('../../../../../../services/errors')
const { MESSAGES, CODES } = require('../../../../../../services/errorCodes')
const mailchimp = require('../../../../../../services/mailchimp')
const { MAILCHIMP_SCHEMA } = require('../../../../../../models/v1/integration-accounts/constants')

module.exports = handler(async ({ query: { apiKey, server } }, res) => {
  const payload = await validate({ apiKey, server }, { schema: MAILCHIMP_SCHEMA })

  try {
    const response = await mailchimp.getLists(payload)
      .then(({ lists }) => lists.map((item) => ({
        id: item.id,
        name: item.name,
      })))

    return res.json({ data: response })
  } catch (error) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }
})
