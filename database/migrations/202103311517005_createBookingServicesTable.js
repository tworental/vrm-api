const { TABLE_NAME } = require('../../src/models/v1/booking-services/constants')
const { TYPES, CHARGE_TYPE } = require('../../src/models/v1/services/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('booking_id').unsigned().notNull()
  table.integer('property_service_id').unsigned()
  table.string('name').notNull()
  table.integer('quantity').unsigned().defaultTo(1)
  table.integer('duration').unsigned()
  table.enum('type', Object.values(TYPES))
  table.enum('charge_type', Object.values(CHARGE_TYPE))
  table.string('currency', 3)
  table.decimal('currency_rate', 10, 2)
  table.decimal('amount', 10, 2).unsigned()
  table.boolean('tax_included')
  table.decimal('tax_value', 5, 2).unsigned()
  table.decimal('total_amount', 10, 2)
  table.decimal('total_amount_exchanged', 10, 2)
  table.date('start_date')
  table.time('start_time')

  table.text('reminders') // TODO: should be jsonb

  table.string('provider_name')
  table.string('provider_email')
  table.string('provider_phone_number')
  table.string('provider_company_name')
  table.string('provider_company_address')
  table.string('provider_contact_person')
  table.string('provider_description')
  table.text('provider_notes')

  table.text('description')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('booking_id')
    .references('bookings.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('property_service_id')
    .references('property_services.id')
    .onUpdate('CASCADE')
    .onDelete('SET NULL')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
