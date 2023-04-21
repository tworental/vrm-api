const createError = require('../../../../../services/errors')
const { getSignedUrl } = require('../../../../../services/s3')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const {
  selectOneBy,
} = require('../../../../../models/v1/owner-reports/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const data = await selectOneBy({ id, accountId })

  if (!data) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const url = await getSignedUrl(data.s3ReportPath)

  return res.redirect(url)
})
