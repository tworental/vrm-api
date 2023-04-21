const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { mimeFromFile } = require('../../../../../services/mime')
const { upload, deleteFiles } = require('../../../../../services/s3')
const {
  updateBy: updateWebsiteBy,
  selectOneBy: selectWebsiteBy,
  generateFilesPath,
} = require('../../../../../models/v1/websites/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/websites/schema')

module.exports = handler(async ({
  files: { favicon }, user: { accountId }, params: { id }, body,
}, res) => {
  const { name, ...payload } = await validate(body, { schema: UPDATE_SCHEMA })

  const website = await selectWebsiteBy({ accountId, id })

  if (!website) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (name) {
    if (await selectWebsiteBy({ accountId, name }).where('id', '!=', id)) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { name: ['unique'] },
      })
    }
  }

  let faviconUrl

  if (favicon) {
    if (!favicon.data) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { favicon: ['required'] },
      })
    }

    const s3Key = generateFilesPath(favicon)(accountId, id)

    const { mime } = await mimeFromFile(favicon)

    const { Location } = await upload(s3Key, Buffer.from(favicon.data, 'binary'), {
      ContentType: mime,
      ACL: 'public-read',
      Metadata: {
        'alt-name': encodeURIComponent(favicon.name),
      },
    })

    try {
      await deleteFiles([website.faviconUrl])
    } catch (error) {}

    faviconUrl = Location
  }

  await updateWebsiteBy({ id }, { ...payload, name, faviconUrl })

  return res.sendStatus(200)
})
