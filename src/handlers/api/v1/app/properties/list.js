const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const {
  selectBy: selectPropertyBy,
} = require('../../../../../models/v1/properties/repositories')
const {
  selectBy: selectPropertyImages,
} = require('../../../../../models/v1/property-images/repositories')
const {
  storageFileUrl,
} = require('../../../../../models/v1/storage/files/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/properties/serializers')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const data = await cache.wrap(cache.key(cache.KEY_DEFS.PROPERTIES_LIST, accountId), async () => {
    const properties = await selectPropertyBy({ accountId })

    let results = []

    if (properties.length) {
      /**
       * Get the main image for the property
       */
      const images = await selectPropertyImages()
        .select(['uuid', 'publicUrl'])
        .join('storage_files', 'storage_files.id', 'property_images.storage_file_id')
        .whereIn('propertyId', properties.map(({ id }) => id))
        .orderBy('main', 'desc')

      results = properties.map((property) => ({
        ...property,
        mainImage: storageFileUrl(images.find((item) => item.propertyId === property.id)),
      }))
    }
    return serialize(PERMITED_COLLECTION_PARAMS, results)
  })

  return res.json({ data })
})
