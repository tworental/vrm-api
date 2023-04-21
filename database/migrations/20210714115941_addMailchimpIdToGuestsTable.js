const {
  TABLE_NAME,
} = require('../../src/models/v1/guests/constants')

exports.up = (knex) => knex.schema.table(TABLE_NAME, (table) => {
  table.string('mailchimp_id', 120).index()
})

exports.down = (knex) => knex.schema.table(TABLE_NAME, (table) => {
  table.dropColumn('mailchimp_id')
})
