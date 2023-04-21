const createError = require('../../../../../services/errors')
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

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/s3')
jest.mock('../../../../../services/utility')
jest.mock('../../../../../models/v1/storage/files/repositories')
jest.mock('../../../../../models/v1/storage/folders/repositories')

const httpHandler = require('./download')

describe('GET /v1/app/storage/download', () => {
  const time = 1479427200000

  const accountId = 'accountId'

  const req = {
    user: { accountId }, query: { },
  }

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => time)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should download files as a ZIP', async () => {
    const filename = 'Archive-2016-11-18T00:00:00.000Z.zip'

    const filesIds = [1, 2]
    const foldersIds = [100, 200]

    const set = jest.fn().mockImplementation((args) => args)
    const res = { set }

    const storageFolders = [
      { id: 100 },
    ]

    const pipe = jest.fn()

    validate.mockResolvedValue({ filesIds, foldersIds })

    selectFilesBy.mockResolvedValue([
      {
        id: 1,
        folderId: 100,
        path: 'path',
        originalFileName: 'file.jpg',
      },
    ])

    selectFoldersBy.mockResolvedValue(storageFolders)
    arrayToFlatTree.mockReturnValue([])
    arrayToHierarchy.mockReturnValue([{ name: 'dir1' }, { name: 'dir2' }])

    zipFiles.mockReturnValue({ pipe })

    await expect(httpHandler(req, res))
      .resolves.toBeUndefined()

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(req.query, { schema: DOWNLOAD_SCHEMA })
    expect(selectFilesBy).toBeCalledWith({ accountId })
    expect(selectFoldersBy).toBeCalledWith({ accountId })
    expect(arrayToFlatTree).toBeCalledWith(storageFolders, 100, 'folderId')
    expect(arrayToHierarchy).toBeCalledWith(100, storageFolders)
    expect(zipFiles).toBeCalledWith(['path'], [{ name: 'dir1/dir2/file.jpg' }])
    expect(set).toHaveBeenNthCalledWith(1, 'content-type', 'application/zip')
    expect(set).toHaveBeenNthCalledWith(2, 'content-disposition', `attachment; filename="${filename}"`)
    expect(pipe).toBeCalledWith(res)
  })

  it('should throw an error if a file does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ filesIds: [], foldersIds: [] })

    selectFilesBy.mockResolvedValue([])
    selectFoldersBy.mockResolvedValue([])

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(req.query, { schema: DOWNLOAD_SCHEMA })
    expect(selectFilesBy).toBeCalledWith({ accountId })
    expect(selectFoldersBy).toBeCalledWith({ accountId })
    expect(arrayToFlatTree).not.toBeCalled()
    expect(arrayToHierarchy).not.toBeCalled()
    expect(createError).toBeCalledWith(422, errorMessage, { code: 'NOT_FOUND' })
    expect(zipFiles).not.toBeCalled()
  })
})
