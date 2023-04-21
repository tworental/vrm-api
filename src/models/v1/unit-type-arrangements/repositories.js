const {
  select, insert, update, remove,
} = require('../../../services/database')
const { selectBy: selectDictArrangements } = require('../dict-arrangements/repositories')

const { TABLE_NAME } = require('./constants')

exports.selectBy = (conditions, trx) => select(TABLE_NAME, conditions, trx)

exports.upsertBy = async (propertyUnitTypeId, data, trx) => {
  if (typeof data === 'undefined') {
    return Promise.resolve()
  }

  /**
   * We must be sure - always is an array
   */
  const items = Array.isArray(data) ? data : []

  const arrangements = await exports.selectBy({ propertyUnitTypeId }, trx)

  const dictionaryIds = await selectDictArrangements()
    .then((results) => results.map(({ id }) => Number(id)))

  /**
   * Accept only payload with existing dictArrangementId in dictionary.
   */
  const payload = items.filter(
    ({ dictArrangementId }) => dictionaryIds.includes(Number(dictArrangementId)),
  )

  return Promise.all([
    /**
     * Remove not used arrangements
     */
    arrangements.filter(
      (arrangement) => !payload.find((o) => Number(arrangement.dictArrangementId) === Number(o.dictArrangementId)),
    ).map(({ id }) => remove(TABLE_NAME, { id }, trx)),

    /**
     * Update current arrangements
     */
    payload.filter((o) => (
      arrangements.find((arrangement) => Number(arrangement.dictArrangementId) === Number(o.dictArrangementId))
    )).map((params) => (
      update(TABLE_NAME, params, { propertyUnitTypeId, dictArrangementId: params.dictArrangementId }, trx)
    )),

    /**
     * Create new arrangements
     */
    payload.filter(
      (o) => !arrangements.find((arrangement) => Number(arrangement.dictArrangementId) === Number(o.dictArrangementId)),
    ).map((params) => insert(TABLE_NAME, { ...params, propertyUnitTypeId }, trx)),
  ].flat())
}
