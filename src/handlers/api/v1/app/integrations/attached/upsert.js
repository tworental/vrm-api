const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { publish } = require('../../../../../../services/pubsub')
const { LISTENERS, TABLE_NAME: INTEGRATIONS_TABLE } = require('../../../../../../models/v1/integrations/constants')
const { TABLE_NAME: ACCOUNT_INTEGRATIONS_TABLE } = require('../../../../../../models/v1/integration-accounts/constants')
const {
  selectOneBy: selectIntegrationBy,
} = require('../../../../../../models/v1/integrations/repositories')
const {
  create: createIntegrationAccount,
  updateBy: updateIntegrationAccountBy,
  selectOneBy: selectIntegrationAccountBy,
} = require('../../../../../../models/v1/integration-accounts/repositories')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/integration-accounts/schema')

module.exports = handler(async ({ body, user: { accountId }, params: { integrationId } }, res) => {
  if (!await selectIntegrationBy({ id: integrationId, enabled: 1 })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const payload = await validate(body, { schema: CREATE_SCHEMA })

  const integration = await selectIntegrationAccountBy({ accountId, integrationId })
    .join(INTEGRATIONS_TABLE, `${INTEGRATIONS_TABLE}.id`, `${ACCOUNT_INTEGRATIONS_TABLE}.integration_id`)
    .clearSelect()
    .select([`${ACCOUNT_INTEGRATIONS_TABLE}.*`, `${INTEGRATIONS_TABLE}.name`])

  if (!integration) {
    await createIntegrationAccount({ ...payload, accountId, integrationId })
  } else {
    await updateIntegrationAccountBy({ accountId, integrationId }, payload)
    publish(LISTENERS.INTEGRATIONS_UPDATE, {
      accountId,
      name: integration.name,
      current: payload,
      old: integration,
    })
  }

  cache.del(`accounts.${accountId}.integrations`)

  return res.sendStatus(202)
})
