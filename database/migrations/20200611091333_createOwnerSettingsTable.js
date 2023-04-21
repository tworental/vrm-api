const {
  TABLE_NAME,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  DEFAULT_LANGUAGE,
} = require('../../src/models/v1/owner-settings/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('owner_id').notNull().unsigned()
  table.string('locale', 5).defaultTo(DEFAULT_LOCALE)
  table.string('timezone', 40).defaultTo(DEFAULT_TIMEZONE)
  table.string('language', 2).defaultTo(DEFAULT_LANGUAGE)
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('owner_id')
    .references('owners.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
