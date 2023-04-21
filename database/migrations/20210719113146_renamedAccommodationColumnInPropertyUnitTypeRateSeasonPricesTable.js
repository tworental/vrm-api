const { TABLE_NAME } = require('../../src/models/v1/unit-type-rate-season-prices/constants')

exports.up = (knex) => knex.schema.table(TABLE_NAME, (table) => {
  table.renameColumn('accommodation', 'occupancy')
})

exports.down = (knex) => knex.schema.table(TABLE_NAME, (table) => {
  table.renameColumn('occupancy', 'accommodation')
})
