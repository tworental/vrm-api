const config = require('config')

const { TABLE_NAME } = require('../../src/models/v1/owner-reports/constants')

const DEFAULT_CURRENCY = config.get('payments.defaultCurrency')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('owner_id').unsigned().notNull()

  table.string('name', 100).notNull()
  table.string('currency', 3).notNull().defaultTo(DEFAULT_CURRENCY)
  table.datetime('date').notNull()
  table.decimal('income', 10, 2).notNull()
  table.string('s3_report_path')

  table.text('notes')

  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id').references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('owner_id').references('owners.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
