const { subscribe } = require('../services/pubsub')
const { LISTENERS, INTEGRATIONS } = require('../models/v1/integrations/constants')
const { updateBy: updateGuestsBy } = require('../models/v1/guests/repositories')

subscribe(LISTENERS.INTEGRATIONS_UPDATE, async (_, data) => {
  switch (data.name) {
    case INTEGRATIONS.MAILCHIMP: {
      const oldSettings = data.old.settings
      const newSettings = data.current.settings

      if (
        newSettings.apiKey
        && newSettings.server
        && newSettings.apiKey === oldSettings.apiKey
        && newSettings.server === oldSettings.server
      ) {
        break
      }

      await updateGuestsBy({ accountId: data.accountId }, { mailchimpId: null })
      break
    }
    default:
      break
  }
})
