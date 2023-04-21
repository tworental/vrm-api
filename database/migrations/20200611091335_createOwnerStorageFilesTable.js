const TABLE_NAME = 'owner_storage_files'

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('owner_id').unsigned().notNull()
  table.integer('storage_file_id').unsigned().notNull()
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('storage_file_id')
    .references('storage_files.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('owner_id')
    .references('owners.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
