const { TABLE_NAME, TOKEN_TYPES } = require('../../src/models/v1/user-tokens/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('user_id').notNull().unsigned()
  table.string('token').unique().index()
  table.string('value')
  table.enum('type', Object.values(TOKEN_TYPES)).notNull()
  table.timestamp('expires_at')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('user_id')
    .references('users.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
