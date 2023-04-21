const {
  select, insert, update, remove,
} = require('../../../services/database')
const { selectBy: selectDictAmenitites } = require('../dict-amenities/repositories')

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

  const amenities = await exports.selectBy({ propertyUnitTypeId }, trx)

  const dictionaryIds = await selectDictAmenitites()
    .then((results) => results.map(({ id }) => Number(id)))

  /**
   * Accept only payload with existing dictAmenityId in dictionary.
   */
  const payload = items.filter(
    ({ dictAmenityId }) => dictionaryIds.includes(Number(dictAmenityId)),
  )

  return Promise.all([
    /**
     * Remove not used amenities
     */
    amenities.filter((amenity) => !payload.find((o) => Number(amenity.dictAmenityId) === Number(o.dictAmenityId)))
      .map(({ id }) => remove(TABLE_NAME, { id }, trx)),

    /**
     * Update current amenities
     */
    payload.filter((o) => amenities.find((amenity) => Number(amenity.dictAmenityId) === Number(o.dictAmenityId)))
      .map((params) => update(TABLE_NAME, params, { propertyUnitTypeId, dictAmenityId: params.dictAmenityId }, trx)),

    /**
     * Create new amenities
     */
    payload.filter((o) => !amenities.find((amenity) => Number(amenity.dictAmenityId) === Number(o.dictAmenityId)))
      .map((params) => insert(TABLE_NAME, { ...params, propertyUnitTypeId }, trx)),
  ].flat())
}
