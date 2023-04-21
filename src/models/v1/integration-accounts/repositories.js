const dao = require('../../../services/dao')
const mailchimp = require('../../../services/mailchimp')

const { TABLE_NAME: ACCOUNT_INTEGRATIONS_TABLE } = require('./constants')
const { TABLE_NAME: INTEGRATIONS_TABLE, INTEGRATIONS } = require('../integrations/constants')

const withIntegration = (queryBuilder) => (
  queryBuilder
    .join(INTEGRATIONS_TABLE, `${INTEGRATIONS_TABLE}.id`, `${ACCOUNT_INTEGRATIONS_TABLE}.integration_id`)
    .clearSelect()
    .select([`${ACCOUNT_INTEGRATIONS_TABLE}.*`, `${INTEGRATIONS_TABLE}.name`])
    .where(`${INTEGRATIONS_TABLE}.enabled`, '=', 1)
)

const upsertGuestToMailchimp = (accountId) => async (payload) => {
  const integration = await withIntegration(
    module.exports.selectOneBy({ accountId, name: INTEGRATIONS.MAILCHIMP }),
  ).where(`${ACCOUNT_INTEGRATIONS_TABLE}.enabled`, '=', '1')

  if (integration && integration.settings) {
    if (!payload.id) {
      return mailchimp.createListMember(integration.settings, payload)
        .catch(() => ({ id: null }))
    }

    return mailchimp.updateListMember(integration.settings, payload)
      .catch(() => ({ id: null }))
  }

  return { id: null }
}

const deleteMailchimpGuest = (accountId) => async (id) => {
  const integration = await withIntegration(
    module.exports.selectOneBy({ accountId, name: INTEGRATIONS.MAILCHIMP }),
  ).where(`${ACCOUNT_INTEGRATIONS_TABLE}.enabled`, '=', '1')

  if (integration && integration.settings) {
    return mailchimp.deleteListMember(integration.settings, id)
  }

  return null
}

module.exports = dao({
  tableName: ACCOUNT_INTEGRATIONS_TABLE,
  jsonFields: ['settings'],
  methods: {
    withIntegration,
    upsertGuestToMailchimp,
    deleteMailchimpGuest,
  },
})
