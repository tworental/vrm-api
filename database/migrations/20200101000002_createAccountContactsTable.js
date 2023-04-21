const { TABLE_NAME } = require('../../src/models/v1/account-contacts/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.string('first_name', 100)
  table.string('last_name', 100)
  table.string('email').index().notNull()
  table.string('primary_phone_number', 40)
  table.string('additional_phone_number', 40)
  table.text('parlance') // TODO: should be jsonb
  table.string('website')
  table.string('avatar')
  table.text('bio')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
