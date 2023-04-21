const TABLE_NAME = 'permission_users'

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('permission_id').unsigned().notNull()
  table.integer('account_id').unsigned().notNull()
  table.integer('user_id').unsigned().notNull()
  table.text('abilities') // TODO: should be jsonb
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('permission_id')
    .references('permissions.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('user_id')
    .references('users.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
