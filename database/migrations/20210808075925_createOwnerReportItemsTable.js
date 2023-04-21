const config = require('config')

const { TABLE_NAME } = require('../../src/models/v1/owner-report-items/constants')

const DEFAULT_CURRENCY = config.get('payments.defaultCurrency')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('owner_id').unsigned().notNull()
  table.integer('owner_report_id').unsigned().notNull()

  table.string('name', 100).notNull()
  table.string('currency', 3).notNull().defaultTo(DEFAULT_CURRENCY)
  table.decimal('currency_rate', 10, 2)
  table.datetime('date_arrival').notNull()
  table.datetime('date_departure').notNull()
  table.integer('total_nights').notNull()
  table.decimal('price_nightly').notNull()
  table.decimal('price_nightly_exchanged').notNull()
  table.decimal('total_amount', 10, 2).notNull()
  table.decimal('total_amount_exchanged', 10, 2)
  table.decimal('charged_amount', 10, 2)
  table.decimal('charged_amount_exchanged', 10, 2)
  table.decimal('commission', 10, 2)
  table.decimal('due', 10, 2)
  table.decimal('due_exchanged', 10, 2)

  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id').references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('owner_id').references('owners.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('owner_report_id').references('owner_reports.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
