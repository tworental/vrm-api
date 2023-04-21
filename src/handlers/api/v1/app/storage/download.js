const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { validate } = require('../../../../../services/validate')
const { handler } = require('../../../../../services/http')
const { zipFiles } = require('../../../../../services/s3')
const {
  arrayToFlatTree,
  arrayToHierarchy,
} = require('../../../../../services/utility')
const {
  selectBy: selectFilesBy,
} = require('../../../../../models/v1/storage/files/repositories')
const {
  selectBy: selectFoldersBy,
} = require('../../../../../models/v1/storage/folders/repositories')
const { DOWNLOAD_SCHEMA } = require('../../../../../models/v1/storage/schema')

module.exports = handler(async (req, res) => {
  const { user: { accountId }, query } = req

  const payload = await validate(query, { schema: DOWNLOAD_SCHEMA })

  const filesIds = [...new Set(payload.filesIds || [])]
  const foldersIds = [...new Set(payload.foldersIds || [])]

  const storageFiles = await selectFilesBy({ accountId })
  const storageFolders = await selectFoldersBy({ accountId })

  const results = [
    ...storageFiles.filter(
      (item) => filesIds.includes(item.id),
    ),

    ...foldersIds.map((id) => {
      const dirs = arrayToFlatTree(storageFolders, id, 'folderId')
        .map((item) => item.id)

      dirs.push(id)

      return storageFiles.filter(
        (item) => dirs.includes(item.folderId),
      )
    }).flat(),
  ]

  const data = results.filter(
    (item, index) => results.findIndex((obj) => obj.id === item.id) === index,
  ).reduce((acc, curr) => {
    const dir = arrayToHierarchy(curr.folderId, storageFolders)
      .map(({ name }) => name)
      .join('/')

    acc.files.push(curr.path)
    acc.mapping.push({ name: `${dir}/${curr.originalFileName}` })

    return acc
  }, { files: [], mapping: [] })

  if (!data.files.length) {
    throw createError(422, MESSAGES.NOT_FOUND, {
      code: CODES.NOT_FOUND,
    })
  }

  const filename = `Archive-${new Date(Date.now()).toISOString()}.zip`

  const archive = await zipFiles(data.files, data.mapping)

  res.set('content-type', 'application/zip')
  res.set('content-disposition', `attachment; filename="${filename}"`)

  return archive.pipe(res)
})
