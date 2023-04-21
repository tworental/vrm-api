const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const {
  create: createPropertyFee,
  selectOneBy: selectPropertyFee,
} = require('../../../../../../models/v1/property-fees/repositories')
const { selectOneBy: selectFee } = require('../../../../../../models/v1/fees/repositories')

module.exports = handler(async ({
  body: { feeId }, params: { propertyId }, account: { id: accountId },
}, res) => {
  if (!await selectProperty({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await selectFee({ id: feeId, accountId })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { feeId: ['notExists'] },
    })
  }

  if (!await selectPropertyFee({ propertyId, feeId })) {
    await createPropertyFee({ propertyId, feeId })
  }

  return res.sendStatus(201)
})
