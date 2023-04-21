const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const {
  selectOneBy: selectPropertyBy,
  completenessDetails: propertyCompleteness,
} = require('../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectPropertyImage,
} = require('../../../../../models/v1/property-images/repositories')
const {
  storageFileUrl,
} = require('../../../../../models/v1/storage/files/repositories')
const { selectBy: selectAmenitiesBy } = require('../../../../../models/v1/property-amenities/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/properties/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const property = await selectPropertyBy({ id, accountId })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  /**
   * We need add informations about completeness of property for each step for frontend.
   */
  const completeness = await propertyCompleteness(property)

  /**
   * We are adding an extra data (property ammenities) to property response.
   */
  const amenities = await selectAmenitiesBy({ propertyId: id })
    .then((results) => results.map(({ dictAmenityId, count }) => ({ dictAmenityId, count })))

  /**
   * Get the main image for the property
   */
  const mainImage = await selectPropertyImage({ propertyId: id })
    .select(['uuid', 'publicUrl'])
    .join('storage_files', 'storage_files.id', 'property_images.storage_file_id')
    .orderBy('main', 'desc')
    .then(storageFileUrl)

  return res.json({
    data: serialize(PERMITED_ITEM_PARAMS, property, { amenities, completeness, mainImage }),
  })
})
