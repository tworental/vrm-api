const createError = require('../../../../../../services/errors')
const { getSignedUrl } = require('../../../../../../services/s3')
const { handler } = require('../../../../../../services/http')
const {
  selectOneBy,
} = require('../../../../../../models/v1/documents/invoices/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/s3')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/documents/invoices/repositories')

const httpHandler = require('./download')

describe('GET /v1/app/documents/invoices/:id/download', () => {
  const id = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should redirect to the resource', async () => {
    const path = 'path'

    const redirect = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue({ s3InvoicePath: path })
    getSignedUrl.mockResolvedValue('path')

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }, { redirect }))
      .resolves.toBe(path)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ id, accountId: 100 })
    expect(getSignedUrl).toBeCalledWith(path)
    expect(redirect).toBeCalledWith(path)
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
