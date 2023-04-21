const cache = require('../../../../../../services/cacheManager')
const { handler } = require('../../../../../../services/http')
const { selectBy } = require('../../../../../../models/v1/documents/invoices/repositories')
const { serialize, PERMITED_COLLECTION_PARAMS } = require('../../../../../../models/v1/documents/invoices/serializers')

module.exports = handler(async ({ user: { accountId }, query: { perPage = 10, currentPage = 1 } }, res) => {
  const { data, pagination } = await cache.wrap(`accounts.${accountId}.invoices.pagination.${perPage}.${currentPage}`, () => (
    selectBy({ accountId })
      .orderBy('invoice_date', 'desc')
      .paginate({
        perPage: Number(perPage),
        currentPage: Number(currentPage),
        isLengthAware: true,
      })
  ))

  return res.json({ data: serialize(PERMITED_COLLECTION_PARAMS, data), meta: { pagination } })
})
