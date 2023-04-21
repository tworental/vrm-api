const { TABLE_NAME, STATUSES, PRIORITIES } = require('../../src/models/v1/units/constants')
const { AREA_UNITS } = require('../../src/models/v1/unit-types/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('property_id').unsigned().notNull()
  table.integer('property_unit_type_id').unsigned().notNull()
  table.integer('owner_id').unsigned()
  table.string('name').notNull()
  table.enum('status', Object.values(STATUSES)).notNull().defaultTo(STATUSES.READY)
  table.enum('priority', Object.values(PRIORITIES)).notNull().defaultTo(PRIORITIES.LOW)
  table.boolean('is_active').notNull().defaultTo(true)
  table.boolean('is_completed').notNull().defaultTo(false)
  table.integer('floor', 3)
  table.integer('area', 5).unsigned()
  table.enum('area_unit', Object.values(AREA_UNITS)).notNull().defaultTo(AREA_UNITS.SQM)
  table.string('color', 24)
  table.text('out_of_service') // TODO: should be jsonb
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
  table.timestamp('deleted_at')

  table.foreign('property_id').references('properties.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('property_unit_type_id').references('property_unit_types.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('owner_id').references('owners.id')
    .onUpdate('CASCADE')
    .onDelete('SET NULL')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
