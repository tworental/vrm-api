const { TABLE_NAME } = require('../../src/models/v1/booking-invoices/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('booking_id').unsigned().notNull()
  table.integer('documents_invoice_id').unsigned()

  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('booking_id')
    .references('bookings.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('documents_invoice_id')
    .references('documents_invoices.id')
    .onUpdate('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
