const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { selectOneBy } = require('../../../../../models/v1/rate-seasons/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/rate-seasons/serializers')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/rate-seasons/repositories')
jest.mock('../../../../../models/v1/rate-seasons/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/rate-seasons/:id', () => {
  const id = 1
  const accountId = 92

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const rate = { id, name: 'name' }
    const data = { id }

    const json = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue(rate)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { id } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, rate)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
