const { TABLE_NAME, DEFAULT_INVOICE_NO_PATTERN } = require('../../src/models/v1/documents/invoices/settings/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.string('invoice_no_pattern', 40).notNull().defaultTo(DEFAULT_INVOICE_NO_PATTERN)
  table.text('seller') // TODO: should be jsonb column
  table.string('s3_logo_path')

  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
