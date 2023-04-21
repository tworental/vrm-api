const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const { selectOneBy: selectCustomerContactBy } = require('../../../../../../models/v1/customer-contacts/repositories')
const {
  create: createPropertyCustomerContact,
  selectOneBy: selectPropertyCustomerContactBy,
} = require('../../../../../../models/v1/property-customer-contacts/repositories')

module.exports = handler(async ({
  body: { customerContactId }, params: { propertyId }, user: { accountId },
}, res) => {
  if (!await selectPropertyBy({ accountId, id: propertyId })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { propertyId: ['notExists'] },
    })
  }

  if (!await selectCustomerContactBy({ accountId, id: customerContactId })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { customerContactId: ['notExists'] },
    })
  }

  if (!await selectPropertyCustomerContactBy({ accountId, propertyId, customerContactId })) {
    await createPropertyCustomerContact({ accountId, propertyId, customerContactId })
  }

  cache.del(`accounts.${accountId}.properties.*`)

  return res.sendStatus(201)
})
