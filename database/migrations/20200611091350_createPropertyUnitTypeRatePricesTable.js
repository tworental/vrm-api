const { TABLE_NAME } = require('../../src/models/v1/unit-type-rate-prices/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('property_unit_type_rate_id').unsigned().notNull()

  table.boolean('enabled').notNull().defaultTo(true)
  table.integer('accommodation').unsigned().notNull()

  table.decimal('price_nightly', 10, 2).unsigned()
  table.decimal('price_weekday_mo', 10, 2).unsigned()
  table.decimal('price_weekday_tu', 10, 2).unsigned()
  table.decimal('price_weekday_we', 10, 2).unsigned()
  table.decimal('price_weekday_th', 10, 2).unsigned()
  table.decimal('price_weekday_fr', 10, 2).unsigned()
  table.decimal('price_weekday_sa', 10, 2).unsigned()
  table.decimal('price_weekday_su', 10, 2).unsigned()

  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id').references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('property_unit_type_rate_id')
    .references('property_unit_type_rates.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
    .withKeyName('ut_rate_prices_ut_rate_id_foreign')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
