const { TABLE_NAME } = require('../../src/models/v1/limits/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.string('name').notNull().unique()
  table.text('value')
  table.string('description')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
