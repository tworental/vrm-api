const { TABLE_NAME } = require('../../src/models/v1/property-images/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('storage_file_id').unsigned().notNull()
  table.integer('property_id').unsigned().notNull()
  table.integer('property_unit_type_id').unsigned()
  table.integer('property_unit_type_unit_id').unsigned()
  table.string('channex_id', 120).index()
  table.boolean('main').defaultTo(false)
  table.integer('position').unsigned().defaultTo(0).notNull()
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('storage_file_id')
    .references('storage_files.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('property_id')
    .references('properties.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('property_unit_type_id')
    .references('property_unit_types.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('property_unit_type_unit_id')
    .references('property_unit_type_units.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
