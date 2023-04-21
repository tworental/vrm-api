const {
  TABLE_NAME, TYPES, GENDERS, TITLES, DOCUMENT_TYPES,
} = require('../../src/models/v1/guests/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('company_id').unsigned()

  table.enum('type', Object.values(TYPES))
  table.string('email').index()
  table.string('phone_number', 40)
  table.enum('gender', Object.values(GENDERS))
  table.enum('title', Object.values(TITLES))
  table.string('first_name')
  table.string('last_name')
  table.string('citizenship', 2)

  table.string('address')
  table.string('city')
  table.string('zip', 20)
  table.string('region')
  table.string('country_code', 2)

  table.enum('document_type', Object.values(DOCUMENT_TYPES))
  table.string('document_number', 40)
  table.date('document_issued_date')
  table.date('document_expiry_date')

  table.date('birth_date')
  table.string('birth_place')
  table.text('labels') // TODO: should be jsonb
  table.text('parlance') // TODO: should be jsonb
  table.text('notes')

  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('company_id')
    .references('companies.id')
    .onUpdate('CASCADE')
    .onDelete('SET NULL')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
