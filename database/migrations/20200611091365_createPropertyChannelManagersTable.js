const { TABLE_NAME } = require('../../src/models/v1/property-channel-managers/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('property_id').unsigned().notNull()
  table.integer('channel_manager_account_id').unsigned().notNull()
  table.boolean('enabled').notNull().defaultTo(false)
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('property_id')
    .references('properties.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('channel_manager_account_id')
    .references('channel_manager_accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
