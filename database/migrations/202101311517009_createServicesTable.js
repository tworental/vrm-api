const {
  TABLE_NAME, TYPES, CHARGE_TYPE,
} = require('../../src/models/v1/services/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('service_provider_id').unsigned()
  table.string('name').notNull()
  table.integer('duration').unsigned()
  table.enum('type', Object.values(TYPES))
  table.enum('charge_type', Object.values(CHARGE_TYPE))
  table.string('currency', 3)
  table.decimal('amount', 10, 2).unsigned()
  table.boolean('tax_included')
  table.decimal('tax_value', 5, 2).unsigned()
  table.text('description')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('service_provider_id')
    .references('service_providers.id')
    .onUpdate('CASCADE')
    .onDelete('SET NULL')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
