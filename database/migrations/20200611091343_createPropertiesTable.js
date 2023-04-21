const { TABLE_NAME } = require('../../src/models/v1/properties/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('dict_property_type_id').unsigned()
  table.string('channex_id', 120).index()
  table.string('channex_subscription_id', 120).index()
  table.string('name').index().notNull()
  table.boolean('is_completed').notNull().defaultTo(false)
  table.string('internal_code').index()
  table.string('registration_number')
  table.boolean('is_address_public').notNull().defaultTo(false)
  table.boolean('multiple_unit_types').notNull().defaultTo(false)
  table.string('checkin_time').defaultTo('14:00')
  table.string('checkout_time').notNull().defaultTo('11:00')
  table.text('languages') // TODO: should be jsonb
  table.text('address') // TODO: should be jsonb
  table.text('coordinates') // TODO: should be jsonb
  table.text('distances') // TODO: should be jsonb
  table.text('directions')
  table.text('description')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
  table.timestamp('deleted_at')

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('dict_property_type_id')
    .references('dict_property_types.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
