const { TABLE_NAME } = require('../../src/models/v1/dict-property-types/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.string('name').notNull().index()
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
