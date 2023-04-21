const { TABLE_NAME } = require('../../src/models/v1/property-taxes/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.string('channex_id', 120).index()
  table.integer('property_id').unsigned().notNull()
  table.integer('tax_id').unsigned().notNull()
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('property_id')
    .references('properties.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('tax_id')
    .references('taxes.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
