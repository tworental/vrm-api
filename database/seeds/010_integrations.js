const { seed } = require('../../src/services/seeder')
const { TABLE_NAME, STRIPE_MAP, INTEGRATIONS } = require('../../src/models/v1/integrations/constants')

exports.seed = (knex) => seed(knex, TABLE_NAME, [
  { name: INTEGRATIONS.MAILCHIMP, enabled: true },
  { name: 'zapier', enabled: false },
  { name: 'integromat', enabled: false },
  { name: 'stripe', enabled: false },
  { stripe_id: STRIPE_MAP.WHITE_LABEL, name: 'whiteLabel', enabled: false },
  { stripe_id: STRIPE_MAP.PRIVATE_LABEL, name: 'privateLabel', enabled: false },
  { name: 'priceLabs', enabled: false },
])
