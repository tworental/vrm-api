const { TABLE_NAME, VAT_TYPES } = require('../../src/models/v1/booking-guests/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('booking_id').unsigned().notNull()
  table.integer('guest_id').unsigned()
  table.enum('vat_type', Object.values(VAT_TYPES)).notNull().defaultTo(VAT_TYPES.LOCAL_VAT)
  table.text('notes')

  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('booking_id')
    .references('bookings.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('guest_id')
    .references('guests.id')
    .onUpdate('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
