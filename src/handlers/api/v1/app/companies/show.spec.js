const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { selectOneBy } = require('../../../../../models/v1/companies/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/companies/serializers')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/companies/repositories')
jest.mock('../../../../../models/v1/companies/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/companies/:id', () => {
  const accountId = 92
  const id = 'id'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const row = 'company'
    const data = 'data'

    const json = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue(row)
    serialize.mockResolvedValue(data)

    await expect(httpHandler({ user: { accountId }, params: { id } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, row)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ accountId: 100, id })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
