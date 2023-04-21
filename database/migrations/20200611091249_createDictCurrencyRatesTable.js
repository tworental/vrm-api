const config = require('config')

const DEFAULT_CURRENCY = config.get('payments.defaultCurrency')

const { TABLE_NAME } = require('../../src/models/v1/dict-currency-rates/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.string('base', 3).notNull().defaultTo(DEFAULT_CURRENCY)
  table.text('rates') // TODO: should be jsonb
  table.date('date').notNull()
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
