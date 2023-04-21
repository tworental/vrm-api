const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { selectOneBy, create } = require('../../../../../../models/v1/storage/folders/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/storage/folders/serializers')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/storage/folders/schema')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../models/v1/storage/folders/repositories')
jest.mock('../../../../../../models/v1/storage/folders/serializers')

const httpHandler = require('./create')

describe('POST /v1/app/storage/folders', () => {
  const userId = 'userId'
  const accountId = 'accountId'

  const res = { data: 'data' }
  const req = { user: { id: userId, accountId } }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a new folder', async () => {
    const id = 1
    const body = {}
    const folder = 'folder'
    const data = 'data'

    const json = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue({})
    create.mockResolvedValue(id)
    selectOneBy.mockResolvedValue(folder)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ ...req, body }, { json }))
      .resolves.toEqual(res)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(create).toBeCalledWith({ ...body, accountId, userId })
    expect(selectOneBy).toHaveBeenNthCalledWith(1, { id })
    expect(cache.del).toBeCalledWith(`accounts.${accountId}.storage.*`)
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, folder)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error if folder does not exsits', async () => {
    const errorMessage = 'Validation Failed'
    const body = { folderId: 100 }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(body)

    await expect(httpHandler({ ...req, body }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(createError).toBeCalledWith(400, errorMessage, {
      errors: { folderId: ['notExists'] },
      code: 'VALIDATION_FAILED',
    })
  })
})
