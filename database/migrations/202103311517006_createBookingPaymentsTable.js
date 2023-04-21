const config = require('config')

const { TABLE_NAME, PAYMENT_TYPES } = require('../../src/models/v1/booking-payments/constants')

const DEFAULT_CURRENCY = config.get('payments.defaultCurrency')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('booking_id').unsigned().notNull()
  table.enum('payment_type', Object.values(PAYMENT_TYPES)).notNull().defaultTo(PAYMENT_TYPES.CREDIT_CARD)
  table.string('currency', 3).notNull().defaultTo(DEFAULT_CURRENCY)
  table.decimal('currency_rate', 10, 2)
  table.decimal('amount', 10, 2).notNull().defaultTo(0)
  table.decimal('amount_exchanged', 10, 2)
  table.date('payment_date').notNull()
  table.text('notes')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('booking_id')
    .references('bookings.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
