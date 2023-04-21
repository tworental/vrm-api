const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const { updateBy: updateAccountBy } = require('../../../../../models/v1/accounts/repositories')
const { updateBy: updateAccountSettingsBy } = require('../../../../../models/v1/account-settings/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/accounts/schema')

module.exports = handler(async ({ auth, account: { id, identifier }, body }, res) => {
  const {
    domain,
    companyName,
    companyAddress,
    companyZip,
    companyCity,
    companyCountry,
    companyVatId,
    ...settings
  } = await validate(body, { schema: UPDATE_SCHEMA })

  await createTransaction(async (trx) => {
    await updateAccountBy({ id }, {
      domain,
      companyName,
      companyAddress,
      companyZip,
      companyCity,
      companyCountry,
      companyVatId,
    }, trx)

    if (settings) {
      await updateAccountSettingsBy({ accountId: id }, settings, trx)
    }
  })

  cache.del([
    `accounts.${identifier}.${auth.jti}`,
    `accounts.${id}.settings`,
  ])

  return res.sendStatus(204)
})
