const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectWebsitePageBy } = require('../../../../../../models/v1/website-pages/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/website-pages/serializers')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../models/v1/websites/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/website-pages/repositories')
jest.mock('../../../../../../models/v1/website-pages/serializers')
jest.mock('../../../../../../models/v1/websites/repositories')

const httpHandler = require('./show')

describe('GET /v1/app/websites/:websiteId/pages/:id', () => {
  const id = 'id'
  const websiteId = 'websiteId'
  const accountId = 'accountId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const data = { id }
    const page = 'page'

    const json = jest.fn().mockImplementation((args) => args)

    selectWebsiteBy.mockResolvedValue(websiteId)
    selectWebsitePageBy.mockResolvedValue(page)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, id } }, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id, websiteId })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, page)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error if website does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectWebsiteBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, id } })).rejects.toThrow(errorMessage)

    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectWebsiteBy.mockResolvedValue(websiteId)
    selectWebsitePageBy.mockResolvedValue(null)
    serialize.mockReturnValue(null)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, id } })).rejects.toThrow(errorMessage)

    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id, websiteId })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, null)
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
