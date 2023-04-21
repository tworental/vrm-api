const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { raw } = require('../../../../../../services/database')
const { getHealthProperties } = require('../../../../../../services/channex')
const { camelcaseKeys } = require('../../../../../../services/utility')
const {
  selectBy: selectChannelManagersBy,
  withAccount,
} = require('../../../../../../models/v1/channel-managers/repositories')
const {
  selectBy: selectPropertyChannelManagers,
} = require('../../../../../../models/v1/property-channel-managers/repositories')
const {
  selectOneBy: selectProperty,
  isPropertyCompleted,
} = require('../../../../../../models/v1/properties/repositories')
const { CHANNEL_MANAGERS } = require('../../../../../../models/v1/channel-managers/constants')

module.exports = handler(async ({ params: { propertyId }, account: { id: accountId } }, res) => {
  const property = await selectProperty({ id: propertyId, accountId })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await isPropertyCompleted(property)) {
    throw createError(422, MESSAGES.NOT_COMPLETED, { code: CODES.NOT_COMPLETED })
  }

  const channelManagers = await withAccount(accountId)(
    selectChannelManagersBy(),
  ).leftJoin(
    selectPropertyChannelManagers()
      .where('property_id', '=', propertyId)
      .as('property_channel_managers'),
    'property_channel_managers.channel_manager_account_id',
    'channel_manager_accounts.id',
  )
    .select([
      raw('property_channel_managers.enabled AS propertyChannelEnabled'),
      raw('channel_manager_accounts.id AS channelManagerAccountId'),
    ])

  const data = await Promise.all(
    channelManagers.map(async ({
      id,
      channelManagerAccountId,
      name,
      enabled: active,
      propertyChannelEnabled: enabled,
    }) => {
      let health

      if (name === CHANNEL_MANAGERS.CHANNEX && enabled) {
        health = await getHealthProperties(property.channexId)
          .then((results) => camelcaseKeys(results.data.attributes))
          .catch(() => {})
      }

      return {
        id,
        channelManagerAccountId,
        name,
        enabled,
        active,
        health,
      }
    }),
  )

  cache.del(`accounts.${accountId}.properties.${propertyId}`)

  return res.json({ data })
})
