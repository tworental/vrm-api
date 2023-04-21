const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { selectOneBy } = require('../../../../../models/v1/sales-channels/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/sales-channels/repositories')

const httpHandler = require('./show')

describe('GET /v1/app/sales-channels/:id', () => {
  const id = 1
  const accountId = 92

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const data = { id }

    const json = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue(data)

    await expect(httpHandler({ user: { accountId }, params: { id } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ accountId, id })
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
