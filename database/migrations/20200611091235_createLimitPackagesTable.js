const TABLE_NAME = 'limit_packages'

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('limit_id').notNull().unsigned()
  table.integer('package_id').notNull().unsigned()
  table.text('value')
  table.string('annotation')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('limit_id')
    .references('limits.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('package_id')
    .references('packages.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
