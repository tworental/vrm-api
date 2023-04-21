const { TABLE_NAME, PRIVACY } = require('../../src/models/v1/unit-type-arrangements/constants')
const { TYPE } = require('../../src/models/v1/dict-arrangements/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('property_unit_type_id').unsigned().notNull()
  table.integer('dict_arrangement_id').unsigned().notNull()
  table.integer('count').unsigned().defaultTo(1)
  table.enum('privacy', Object.values(PRIVACY)).notNull()
  table.enum('type', Object.values(TYPE)).notNull()
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('property_unit_type_id')
    .references('property_unit_types.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('dict_arrangement_id')
    .references('dict_arrangements.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
