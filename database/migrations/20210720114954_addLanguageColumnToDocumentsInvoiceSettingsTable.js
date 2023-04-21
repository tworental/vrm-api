const { TABLE_NAME, DEFAULT_LANGUAGE } = require('../../src/models/v1/documents/invoices/settings/constants')

exports.up = (knex) => knex.schema.table(TABLE_NAME, (table) => {
  table.string('language', 10).defaultTo(DEFAULT_LANGUAGE)
})

exports.down = (knex) => knex.schema.table(TABLE_NAME, (table) => {
  table.dropColumn('language')
})
