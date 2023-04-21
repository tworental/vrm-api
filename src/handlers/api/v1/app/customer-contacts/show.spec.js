const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { selectOneBy } = require('../../../../../models/v1/customer-contacts/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/customer-contacts/serializers')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/errorCodes')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/customer-contacts/repositories')
jest.mock('../../../../../models/v1/customer-contacts/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/customer-contacts/:id', () => {
  const id = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const accountId = 92
    const guest = {
      id: 100,
      name: 'name',
    }

    const results = { data: { id } }

    const json = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue(guest)
    serialize.mockReturnValue(results.data)

    await expect(httpHandler({ user: { accountId }, params: { id } }, { json }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, guest)
    expect(json).toBeCalledWith(results)
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
