const {
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  DEFAULT_LANGUAGE,
} = require('../../src/models/v1/account-settings/constants')

const { TABLE_NAME } = require('../../src/models/v1/user-settings/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('user_id').notNull().unsigned()
  table.string('locale', 5).defaultTo(DEFAULT_LOCALE)
  table.string('timezone', 40).defaultTo(DEFAULT_TIMEZONE)
  table.string('language', 2).defaultTo(DEFAULT_LANGUAGE)
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('user_id')
    .references('users.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
