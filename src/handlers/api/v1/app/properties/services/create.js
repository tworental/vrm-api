const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const {
  create: createPropertyService,
  selectOneBy: selectPropertyService,
} = require('../../../../../../models/v1/property-services/repositories')
const { selectOneBy: selectService } = require('../../../../../../models/v1/services/repositories')

module.exports = handler(async ({
  body: { serviceId }, params: { propertyId }, account: { id: accountId },
}, res) => {
  if (!await selectProperty({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await selectService({ id: serviceId, accountId })) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { serviceId: ['notExists'] },
    })
  }

  if (!await selectPropertyService({ propertyId, serviceId })) {
    await createPropertyService({ propertyId, serviceId })
  }

  return res.sendStatus(200)
})
