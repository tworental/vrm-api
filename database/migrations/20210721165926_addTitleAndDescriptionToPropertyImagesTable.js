const { TABLE_NAME } = require('../../src/models/v1/property-images/constants')

exports.up = (knex) => knex.schema.table(TABLE_NAME, (table) => {
  table.string('title', 191)
  table.string('description', 1024)
})

exports.down = (knex) => knex.schema.table(TABLE_NAME, (table) => {
  table.dropColumn('title')
  table.dropColumn('description')
})
