const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const { selectBy: selectPropertyFees } = require('../../../../../../models/v1/property-fees/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/property-fees/serializers')

module.exports = handler(async ({
  params: { propertyId }, account: { id: accountId },
}, res) => {
  if (!await selectProperty({ id: propertyId, accountId })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const data = await selectPropertyFees({ propertyId })
    .select(['fees.*', 'property_fees.id'])
    .join('fees', 'fees.id', 'property_fees.fee_id')
    .then((results) => serialize(PERMITED_COLLECTION_PARAMS, results))

  return res.json({ data })
})
