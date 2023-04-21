const { seed } = require('../../src/services/seeder')
const { TABLE_NAME, CHANNEL_MANAGERS } = require('../../src/models/v1/channel-managers/constants')

exports.seed = (knex) => seed(knex, TABLE_NAME, [
  { name: CHANNEL_MANAGERS.CHANNEX, enabled: true },
])
