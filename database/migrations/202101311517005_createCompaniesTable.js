const { TABLE_NAME, TYPES, DISCOUNT_TYPES } = require('../../src/models/v1/companies/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()

  table.string('name')
  table.enum('type', Object.values(TYPES))
  table.string('registration_number')
  table.string('vat_id')

  table.string('bank_name')
  table.string('bank_iban')
  table.string('bank_bic')

  table.string('email')
  table.string('phone_number', 40)

  table.string('address')
  table.string('city')
  table.string('zip', 20)
  table.string('region')
  table.string('country_code', 2)

  table.enum('discount_type', Object.values(DISCOUNT_TYPES))
  table.decimal('discount_value', 10, 2)

  table.boolean('is_active').notNull().defaultTo(true)
  table.text('labels') // TODO: should be jsonb
  table.text('notes')

  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
