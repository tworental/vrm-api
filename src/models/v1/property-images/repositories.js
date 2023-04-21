const { select, update } = require('../../../services/database')
const dao = require('../../../services/dao')

const { TABLE_NAME: TABLE_FILES } = require('../storage/files/constants')
const { TABLE_NAME: TABLE_IMAGES } = require('./constants')

const withFiles = (queryBuilder) => (
  queryBuilder
    .select([`${TABLE_IMAGES}.*`, `${TABLE_FILES}.path`, `${TABLE_FILES}.publicUrl`, `${TABLE_FILES}.uuid`])
    .join(TABLE_FILES, `${TABLE_FILES}.id`, `${TABLE_IMAGES}.storage_file_id`)
)

const storageFiles = (propertyId, propertyUnitTypeId = null, propertyUnitTypeUnitId = null) => withFiles(
  select(TABLE_IMAGES, { propertyId, propertyUnitTypeId, propertyUnitTypeUnitId })
    .orderBy('position', 'ASC'),
)

const shiftImagePositions = async (
  startIdx,
  propertyId,
  propertyUnitTypeId = null,
  propertyUnitTypeUnitId = null,
  trx,
) => {
  const images = await storageFiles(propertyId, propertyUnitTypeId, propertyUnitTypeUnitId)
    .whereRaw('position >= ?', [startIdx])

  await Promise.all(
    images.map((image) => update(TABLE_IMAGES, { position: image.position - 1 }, { id: image.id }, trx)),
  )
}

module.exports = dao({
  tableName: TABLE_IMAGES,
  storageDir: 'properties',
  methods: {
    storageFiles,
    shiftImagePositions,
    withFiles,
  },
})
