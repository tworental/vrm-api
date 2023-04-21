const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const {
  deleteBy,
  selectOneBy: selectWebsitePageBy,
} = require('../../../../../../models/v1/website-pages/repositories')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../models/v1/websites/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/websites/repositories')
jest.mock('../../../../../../models/v1/website-pages/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/websites/:websiteId/pages/:id', () => {
  const accountId = 'accountId'
  const id = 'id'
  const websiteId = 'websiteId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const statusCode = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectWebsiteBy.mockResolvedValue(websiteId)
    selectWebsitePageBy.mockResolvedValue({ id })
    deleteBy.mockResolvedValue(id)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, id } }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id, websiteId })
    expect(deleteBy).toBeCalledWith({ id })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error when website does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectWebsiteBy.mockResolvedValue(websiteId)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, id } })).rejects.toThrow(errorMessage)

    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(deleteBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when website page does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectWebsiteBy.mockResolvedValue(websiteId)
    selectWebsitePageBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, id } })).rejects.toThrow(errorMessage)

    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id, websiteId })
    expect(deleteBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
