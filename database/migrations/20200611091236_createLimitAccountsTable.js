const TABLE_NAME = 'limit_accounts'

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('limit_id').notNull().unsigned()
  table.integer('account_id').unsigned().notNull()
  table.text('value')
  table.string('annotation')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('limit_id')
    .references('limits.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
