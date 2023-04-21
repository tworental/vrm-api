const cache = require('../../../../../services/cacheManager')
const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { createTransaction } = require('../../../../../services/database')
const { upsertGroup, deleteProperty } = require('../../../../../services/channex')
const { validate } = require('../../../../../services/validate')
const {
  updateBy: updateAccountBy,
} = require('../../../../../models/v1/accounts/repositories')
const {
  updateBy: updatePropertiesBy,
} = require('../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectChannelManagerBy,
} = require('../../../../../models/v1/channel-managers/repositories')
const {
  selectBy: selectPropertyChannelManagersBy,
  deleteBy: deletePropertyChannelManagersBy,
} = require('../../../../../models/v1/property-channel-managers/repositories')
const {
  selectOneBy: selectChannelManagerAccountBy,
  updateBy: updateChannelManagerAccountBy,
  create: createChannelManagerAccount,
} = require('../../../../../models/v1/channel-manager-accounts/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/channel-manager-accounts/schema')

module.exports = handler(async ({ body, account, params: { id: channelManagerId } }, res) => {
  const channelManager = await selectChannelManagerBy({ id: channelManagerId, enabled: 1 })

  if (!channelManager) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const { enabled } = await validate(body, { schema: UPDATE_SCHEMA })

  const accountId = account.id

  let channelManagerAccount = await selectChannelManagerAccountBy({
    accountId, channelManagerId,
  })

  if (!channelManagerAccount) {
    channelManagerAccount = await createChannelManagerAccount({
      accountId, channelManagerId,
    })
  }

  await createTransaction(async (trx) => {
    await updateChannelManagerAccountBy({ id: channelManagerAccount.id }, { enabled }, trx)

    if (enabled) {
      const channexId = await upsertGroup(account)
        .then(({ data }) => data.id)

      await updateAccountBy({ id: account.id }, { channexId }, trx)
    } else {
      const propertyChannelManagers = await selectPropertyChannelManagersBy()
        .select('channex_id')
        .join('properties', 'properties.id', 'property_channel_managers.property_id')
        .where('properties.account_id', '=', accountId)
        .whereNotNull('channex_id')

      await Promise.all(propertyChannelManagers.map((item) => (
        deleteProperty(item.channexId)
      )))

      await updateAccountBy({ id: accountId }, { channexId: null }, trx)

      await updatePropertiesBy({ accountId }, { channexId: null }, trx)
        .whereIn('id', propertyChannelManagers.map(({ propertyId }) => propertyId))

      await deletePropertyChannelManagersBy({ accountId }, trx)
    }
  })

  cache.del(`accounts.${account.identifier}.*`)

  return res.sendStatus(200)
})
