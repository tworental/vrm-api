const { TABLE_NAME } = require('../../src/models/v1/permissions/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.string('name').unique()
  table.boolean('allow_read').notNull().defaultTo(true)
  table.boolean('allow_write').notNull().defaultTo(true)
  table.boolean('allow_delete').notNull().defaultTo(true)
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
