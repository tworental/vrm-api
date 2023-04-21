const { TABLE_NAME, TYPES } = require('../../src/models/v1/dict-amenities/constants')

exports.up = (knex) => knex.schema.table(TABLE_NAME, (table) => {
  table.enum('type', Object.values(TYPES))
})

exports.down = (knex) => knex.schema.table(TABLE_NAME, (table) => {
  table.dropColumn('type')
})
