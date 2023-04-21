const { TABLE_NAME } = require('../../src/models/v1/storage/folders/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('user_id').unsigned()
  table.integer('folder_id').unsigned()
  table.string('uuid', 64).unique()
  table.string('name').index()
  table.boolean('pinned').defaultTo(false).notNull()
  table.boolean('starred').defaultTo(false).notNull()
  table.boolean('system').defaultTo(false).notNull()
  table.boolean('hidden').defaultTo(false).notNull()
  table.text('labels') // TODO: should be jsonb
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
  table.timestamp('deleted_at')

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('user_id')
    .references('users.id')
    .onUpdate('CASCADE')
    .onDelete('SET NULL')

  table.foreign('folder_id')
    .references('storage_folders.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
