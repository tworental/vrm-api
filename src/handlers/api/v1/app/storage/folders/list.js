const cache = require('../../../../../../services/cacheManager')
const { handler } = require('../../../../../../services/http')
const { arrayToFlatTree } = require('../../../../../../services/utility')
const { selectBy: selectFilesBy } = require('../../../../../../models/v1/storage/files/repositories')
const { selectBy: selectFoldersBy } = require('../../../../../../models/v1/storage/folders/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/storage/folders/serializers')

module.exports = handler(async ({ user: { accountId }, query: { id, deleted = 0 } }, res) => {
  const folders = await cache.wrap(cache.key(cache.KEY_DEFS.STORAGE_FOLDERS_LIST, accountId, { id, deleted }), () => (
    selectFoldersBy({
      accountId, folderId: id, hidden: '0', __deleted: deleted,
    })
  ))

  /**
   * We are getting all folder ids starts from root (null)
   */
  const folderIds = arrayToFlatTree(folders, null, 'folderId')
    .map((item) => item.id)

  /**
   * The files are needed to calulate size of the folder.
   */
  const files = await cache.wrap(
    cache.key(cache.KEY_DEFS.STORAGE_FILES_LIST, accountId, { folderIds, deleted }),
    () => (
      selectFilesBy({ accountId, __deleted: deleted })
        .whereIn('folderId', folderIds)
    ),
  )

  /**
   * Add to each folder extra attributes like how many files the folder has
   * and what is a total size of the folder.
   */
  const data = folders.map((folder) => {
    const dirs = arrayToFlatTree(folders, folder.id, 'folderId')
      .map((item) => item.id)

    dirs.push(folder.id)

    const items = files.filter((item) => dirs.includes(item.folderId))

    return serialize(PERMITED_COLLECTION_PARAMS, folder, {
      files: items.length,
      size: items.reduce((acc, curr) => acc + Number(curr.size || 0), 0),
    })
  })

  return res.json({ data })
})
