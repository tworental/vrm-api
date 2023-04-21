const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const {
  selectBy: selectPropertyCustomerContactsBy,
  withCustomerContacts,
} = require('../../../../../../models/v1/property-customer-contacts/repositories')

module.exports = handler(async ({ user: { accountId }, params: { propertyId } }, res) => {
  if (!await selectPropertyBy({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await withCustomerContacts(
    selectPropertyCustomerContactsBy({ propertyId })
      .where('customer_contacts.account_id', '=', accountId),
  )

  return res.json({ data })
})
