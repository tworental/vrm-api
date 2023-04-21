const { TABLE_NAME, CATEGORIES } = require('../../src/models/v1/dict-amenities/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.string('channex_id', 120).index()
  table.string('name').notNull()
  table.enum('category', Object.values(CATEGORIES)).notNull().index()
  table.string('icon')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
