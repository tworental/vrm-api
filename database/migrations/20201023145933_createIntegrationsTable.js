const { TABLE_NAME } = require('../../src/models/v1/integrations/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.string('stripe_id', 100).unique()
  table.string('name').notNull()
  table.boolean('enabled').notNull().defaultTo(false)
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
