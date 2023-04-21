const { handler } = require('../../../../../../services/http')
const {
  selectOneBy: selectIntegrationBy,
} = require('../../../../../../models/v1/integrations/repositories')
const {
  selectOneBy: selectIntegrationAccountBy,
} = require('../../../../../../models/v1/integration-accounts/repositories')

module.exports = handler(async ({ user: { accountId }, params: { integrationId } }, res) => {
  let data = null

  if (await selectIntegrationBy({ id: integrationId, enabled: 1 })) {
    data = await selectIntegrationAccountBy({ accountId, integrationId })
  }

  return res.json({ data })
})
