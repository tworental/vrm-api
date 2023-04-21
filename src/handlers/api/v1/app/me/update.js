const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { upload } = require('../../../../../services/s3')
const { sanitizePayload, createTransaction } = require('../../../../../services/database')
const { validate } = require('../../../../../services/validate')
const { updateBy: updateUserBy, generateAvatarPath } = require('../../../../../models/v1/users/repositories')
const { updateBy: updateUserSettingsBy } = require('../../../../../models/v1/user-settings/repositories')
const { UPDATE_ME_SCHEMA } = require('../../../../../models/v1/users/schema')

module.exports = handler(async ({ files, user: { id, accountId }, body }, res) => {
  const {
    locale, timezone, language, ...params
  } = await validate(body, { schema: UPDATE_ME_SCHEMA })

  if (files.avatar) {
    params.avatar = generateAvatarPath(accountId, id, files.avatar)

    await upload(params.avatar, Buffer.from(files.avatar.data, 'binary'), {
      ContentType: files.avatar.mimetype,
      Metadata: {
        'alt-name': encodeURIComponent(files.avatar.name),
      },
    })
  }

  await createTransaction(async (trx) => {
    await sanitizePayload(params, (payload) => updateUserBy({ id, accountId }, payload, trx))

    await sanitizePayload({
      locale, timezone, language,
    }, (payload) => updateUserSettingsBy({ userId: id }, payload, trx))
  })

  cache.del([
    `accounts.${accountId}.users.${id}`,
    `accounts.${accountId}.users.${id}.settings`,
    `accounts.${accountId}.users.${id}.premissions`,
  ])

  return res.sendStatus(204)
})
