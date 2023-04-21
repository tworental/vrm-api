const dao = require('../../../../services/dao')
const { arrayToFlatTree } = require('../../../../services/utility')

const { TABLE_NAME } = require('./constants')

const getTreeIds = (folders, folderIds) => {
  const ids = folderIds.map((id) => Number(id)).flatMap((id) => [
    ...folders.filter((folder) => folder.id === id),
    ...arrayToFlatTree(folders, id, 'folderId'),
  ]).filter(Boolean)

  return [...new Set(ids.map((({ id }) => id)))]
}

module.exports = dao({
  tableName: TABLE_NAME,
  uuidField: 'uuid',
  jsonFields: ['labels'],
  softDelete: true,
  methods: {
    getTreeIds,
  },
})
