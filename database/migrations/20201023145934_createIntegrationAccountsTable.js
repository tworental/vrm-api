const TABLE_NAME = 'integration_accounts'

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('integration_id').notNull().unsigned()
  table.boolean('enabled').notNull().defaultTo(false)
  table.text('settings') // TODO: should be jsonb
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('integration_id')
    .references('integrations.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
