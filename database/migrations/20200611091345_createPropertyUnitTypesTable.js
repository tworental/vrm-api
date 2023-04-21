const {
  TABLE_NAME, PRIVACY, DEFAULT_GUESTS, AREA_UNITS,
} = require('../../src/models/v1/unit-types/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('property_id').unsigned().notNull()
  table.integer('dict_guest_type_id').unsigned()
  table.string('channex_id', 120).index()
  table.string('name').index().notNull()
  table.boolean('is_completed').notNull().defaultTo(false)
  table.integer('area', 5).unsigned()
  table.integer('total_guests', 3).unsigned().notNull().defaultTo(DEFAULT_GUESTS)
  table.integer('max_adults').defaultTo(DEFAULT_GUESTS).notNull()
  table.integer('max_children').defaultTo(0).notNull()
  table.integer('max_infants').defaultTo(0).notNull()
  table.enum('area_unit', Object.values(AREA_UNITS)).notNull().defaultTo(AREA_UNITS.SQM)
  table.enum('privacy', Object.values(PRIVACY))
  table.string('color', 24)
  table.text('description')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
  table.timestamp('deleted_at')

  table.foreign('property_id')
    .references('properties.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('dict_guest_type_id')
    .references('dict_guest_types.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
