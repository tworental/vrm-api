const createError = require('../../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../../services/errorCodes')
const { handler } = require('../../../../../../../services/http')
const { selectBy } = require('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
const {
  PERMITED_COLLECTION_PARAMS, serialize,
} = require('../../../../../../../models/v1/unit-type-rate-seasons/serializers')

const FILTER_EXPIRED_STATE = 'expired'

module.exports = handler(async ({
  user: { accountId }, params: { propertyUnitTypeId }, query: { filter },
}, res) => {
  const seasonRates = await selectBy({ propertyUnitTypeId, accountId })
    .andWhere((queryBuilder) => {
      const CURRENT_DATE = new Date(Date.now())

      if (filter === FILTER_EXPIRED_STATE) {
        queryBuilder.where('end_date', '<', CURRENT_DATE)
          .orWhereNull('end_date')
      } else {
        queryBuilder.where('end_date', '>=', CURRENT_DATE)
      }
    })
    .orderBy([
      { column: 'start_date', order: 'asc' },
      { column: 'end_date', order: 'desc' },
      { column: 'id', order: 'desc' },
    ])

  if (!seasonRates) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  return res.json({
    data: serialize(PERMITED_COLLECTION_PARAMS, seasonRates),
  })
})
