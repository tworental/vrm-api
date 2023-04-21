const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const {
  create: createPropertyTax,
  selectOneBy: selectPropertyTax,
} = require('../../../../../../models/v1/property-taxes/repositories')
const { selectOneBy: selectTax } = require('../../../../../../models/v1/taxes/repositories')

module.exports = handler(async ({
  body: { taxId }, params: { propertyId }, account: { id: accountId },
}, res) => {
  if (!await selectProperty({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await selectTax({ id: taxId, accountId })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { taxId: ['notExists'] },
    })
  }

  if (!await selectPropertyTax({ propertyId, taxId })) {
    await createPropertyTax({ propertyId, taxId })
  }

  return res.sendStatus(201)
})
