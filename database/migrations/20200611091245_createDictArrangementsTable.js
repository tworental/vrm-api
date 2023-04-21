const { TABLE_NAME, TYPE } = require('../../src/models/v1/dict-arrangements/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.string('name').notNull().index()
  table.enum('type', Object.values(TYPE)).notNull()
  table.string('icon')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
