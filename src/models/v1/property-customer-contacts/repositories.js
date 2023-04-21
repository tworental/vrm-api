const dao = require('../../../services/dao')
const { raw } = require('../../../services/database')

const { TABLE_NAME: PROPERTY_CUSTOMER_CONTACTS_TABLE_NAME } = require('./constants')
const { TABLE_NAME: CUSTOMER_CONTACTS_TABLE_NAME } = require('../customer-contacts/constants')

const withCustomerContacts = (queryBuilder) => (
  queryBuilder
    .clearSelect()
    .join(
      CUSTOMER_CONTACTS_TABLE_NAME,
      `${CUSTOMER_CONTACTS_TABLE_NAME}.id`,
      `${PROPERTY_CUSTOMER_CONTACTS_TABLE_NAME}.customer_contact_id`,
    )
    .select([
      `${CUSTOMER_CONTACTS_TABLE_NAME}.*`,
      `${PROPERTY_CUSTOMER_CONTACTS_TABLE_NAME}.id`,
      raw(`${CUSTOMER_CONTACTS_TABLE_NAME}.id AS customerContactId`),
    ])
)

module.exports = dao({
  tableName: PROPERTY_CUSTOMER_CONTACTS_TABLE_NAME,
  methods: {
    withCustomerContacts,
  },
})
