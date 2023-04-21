const { TABLE_NAME } = require('../../src/models/v1/unit-amenities/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('property_unit_type_unit_id').unsigned().notNull()
  table.integer('dict_amenity_id').unsigned().notNull()
  table.integer('count').unsigned().defaultTo(1)
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('property_unit_type_unit_id')
    .references('property_unit_type_units.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
    .withKeyName('unit_amenities_unit_id_foreign')

  table.foreign('dict_amenity_id').references('dict_amenities.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
