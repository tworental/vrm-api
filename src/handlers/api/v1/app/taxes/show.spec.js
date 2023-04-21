const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { selectOneBy } = require('../../../../../models/v1/taxes/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/taxes/serializers')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/taxes/repositories')
jest.mock('../../../../../models/v1/taxes/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/taxes/:id', () => {
  const id = 'id'
  const accountId = 'accountId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const tax = 'tax'

    const data = { id }

    const json = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue(tax)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { id } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, tax)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)
    serialize.mockReturnValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, null)
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
