const { handler } = require('../../../../../services/http')
const { upload } = require('../../../../../services/s3')
const { sanitizePayload, createTransaction } = require('../../../../../services/database')
const { validate } = require('../../../../../services/validate')
const { updateById: updateOwnerById, generateAvatarPath } = require('../../../../../models/v1/owners/repositories')
const { updateBy: updateOwnerSettingsBy } = require('../../../../../models/v1/owner-settings/repositories')
const { UPDATE_ME_SCHEMA } = require('../../../../../models/v1/owners/schema')

module.exports = handler(async ({ files: { avatar }, user: { id, accountId }, body }, res) => {
  const {
    locale, timezone, language, ...params
  } = await validate(body, { schema: UPDATE_ME_SCHEMA })

  if (avatar) {
    params.avatar = generateAvatarPath(accountId, id, avatar)

    await upload(params.avatar, Buffer.from(avatar.data, 'binary'), {
      ContentType: avatar.mimetype,
      Metadata: {
        'alt-name': encodeURIComponent(avatar.name),
      },
    })
  }

  await createTransaction(async (trx) => {
    await sanitizePayload(params, (payload) => updateOwnerById({ id }, payload, trx))

    await sanitizePayload({
      locale, timezone, language,
    }, (payload) => updateOwnerSettingsBy({ ownerId: id }, payload, trx))
  })

  return res.sendStatus(204)
})
