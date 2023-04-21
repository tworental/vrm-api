const { TABLE_NAME, TIME_UNITS, EVENT_TYPES } = require('../../src/models/v1/service-reminders/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('service_id').unsigned().notNull()
  table.integer('time').unsigned().notNull()
  table.enum('time_unit', Object.values(TIME_UNITS)).notNull()
  table.enum('event_type', Object.values(EVENT_TYPES)).notNull()
  table.boolean('reminder_sms').notNull()
  table.boolean('reminder_email').notNull()
  table.string('phone_number')
  table.string('email')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('service_id')
    .references('services.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
