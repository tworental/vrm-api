const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { selectOneBy, updateBy } = require('../../../../../../models/v1/storage/folders/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/storage/folders/schema')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../models/v1/storage/folders/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/storage/folders/:id', () => {
  const accountId = 'accountId'
  const id = 'id'

  const body = 'body'

  const req = {
    user: { accountId },
    params: { id },
    body,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const results = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(body)
    selectOneBy.mockResolvedValue({ id, system: 0 })
    updateBy.mockResolvedValue()

    await expect(httpHandler(req, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ id, accountId })
    expect(updateBy).toBeCalledWith({ id, accountId }, body)
    expect(cache.del).toBeCalledWith(`accounts.${accountId}.storage.*`)
    expect(sendStatus).toBeCalledWith(204)
  })

  it('should throw an error if a folder does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
    expect(updateBy).not.toBeCalled()
  })

  it('should throw an error if is a "system" folder', async () => {
    const errorMessage = 'You can not update a "system" directory'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue({ id, system: 1 })

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(createError).toBeCalledWith(400, errorMessage)
    expect(updateBy).not.toBeCalled()
  })
})
