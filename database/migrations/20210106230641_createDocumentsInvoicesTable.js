const config = require('config')

const {
  TABLE_NAME, PAYMENT_TYPES, TAX_NOTATIONS, INVOICE_TYPES, INVOICE_STATUSES,
} = require('../../src/models/v1/documents/invoices/constants')

const DEFAULT_CURRENCY = config.get('payments.defaultCurrency')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('invoice_id').unsigned()
  table.string('invoice_no', 40).notNull()
  table.boolean('is_paid').notNull().defaultTo(false)
  table.enum('status', Object.values(INVOICE_STATUSES)).notNull().defaultTo(INVOICE_STATUSES.DRAFT)
  table.enum('invoice_type', Object.values(INVOICE_TYPES)).notNull()
  table.enum('payment_type', Object.values(PAYMENT_TYPES))
  table.enum('tax_notation', Object.values(TAX_NOTATIONS)).notNull().defaultTo(TAX_NOTATIONS.VAT)
  table.string('invoice_title', 100)
  table.date('invoice_date')
  table.date('invoice_due_date')
  table.string('seller_name').notNull()
  table.string('seller_address', 191)
  table.string('seller_zip', 20)
  table.string('seller_city', 100)
  table.string('seller_country', 2)
  table.string('seller_tax_id', 60)
  table.string('buyer_name').notNull()
  table.string('buyer_address', 191)
  table.string('buyer_zip', 20)
  table.string('buyer_city', 100)
  table.string('buyer_country', 2)
  table.string('buyer_tax_id', 60)
  table.text('invoice_items') // TODO: should be jsonb
  // table.text('properties') // TODO: should be jsonb
  table.text('invoice_note')
  table.string('currency', 3).defaultTo(DEFAULT_CURRENCY)
  table.decimal('subtotal_amount', 10, 2)
  table.decimal('total_amount', 10, 2)
  table.string('s3_invoice_path')
  table.text('logo_base64')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('invoice_id')
    .references('documents_invoices.id')
    .onUpdate('CASCADE')
    .onDelete('SET NULL')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
