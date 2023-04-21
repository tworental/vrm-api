const { TABLE_NAME } = require('../../src/models/v1/channel-managers/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.string('name').notNull().unique()
  table.boolean('enabled').notNull().defaultTo(false)
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
