const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy } = require('../../../../../../models/v1/documents/invoices/repositories')
const { serialize, PERMITED_ITEM_PARAMS } = require('../../../../../../models/v1/documents/invoices/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/documents/invoices/repositories')
jest.mock('../../../../../../models/v1/documents/invoices/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/documents/invoices/:id', () => {
  const id = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const results = { data: { id } }
    const invoice = 'invoice'

    const json = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue(invoice)
    serialize.mockReturnValue(results.data)

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }, { json }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ id, accountId: 100 })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, invoice)
    expect(json).toBeCalledWith(results)
  })

  it('should throw an error if resource does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId: 100 })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
