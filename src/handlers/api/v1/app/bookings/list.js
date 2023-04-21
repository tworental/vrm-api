const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { filterBookings } = require('../../../../../models/v1/bookings/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/bookings/serializers')
const { FETCH_LIST_SCHEMA } = require('../../../../../models/v1/bookings/schema')

module.exports = handler(async ({ user: { accountId }, query }, res) => {
  const {
    perPage,
    currentPage,
    startDate,
    endDate,
    priceMin,
    priceMax,
    statuses = [],
    propertyIds = [],
    propertyUnitTypeIds = [],
    propertyUnitTypeUnitIds = [],
  } = await validate(query, { schema: FETCH_LIST_SCHEMA })

  const cacheKey = cache.key(cache.KEY_DEFS.BOOKINGS_LIST, accountId, {
    perPage,
    currentPage,
    propertyIds,
    propertyUnitTypeIds,
    propertyUnitTypeUnitIds,
    prices: [priceMin, priceMax].join(','),
    period: [startDate, endDate].join(','),
    statuses,
  })

  const { data, pagination } = await cache.wrap(cacheKey, () => (
    filterBookings({
      accountId,
      priceMin,
      priceMax,
      startDate,
      endDate,
      propertyIds,
      propertyUnitTypeIds,
      statuses,
    }, currentPage, perPage)
  ))

  return res.json({
    data: serialize(PERMITED_COLLECTION_PARAMS, data),
    meta: { pagination },
  })
})
