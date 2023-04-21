const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const {
  selectBy: selectWebsitePageTagBy,
} = require('../../../../../../../models/v1/website-page-tags/repositories')
const {
  PERMITED_COLLECTION_PARAMS, serialize,
} = require('../../../../../../../models/v1/website-page-tags/serializers')
const {
  selectOneBy: selectWebsitePageBy,
} = require('../../../../../../../models/v1/website-pages/repositories')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../../models/v1/websites/repositories')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/errorCodes')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../models/v1/website-page-tags/repositories')
jest.mock('../../../../../../../models/v1/website-page-tags/serializers')
jest.mock('../../../../../../../models/v1/website-pages/repositories')
jest.mock('../../../../../../../models/v1/websites/repositories')

const httpHandler = require('./list')

describe('GET /v1/app/websites/:websiteId/pages/:websitePageId/tags', () => {
  const data = ['page']
  const results = 'pages'
  const websitePageId = 'websitePageId'
  const websiteId = 'websiteId'
  const accountId = 'accountId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const json = jest.fn().mockImplementation((args) => args)

    selectWebsiteBy.mockResolvedValue(websiteId)
    selectWebsitePageBy.mockResolvedValue(websitePageId)
    selectWebsitePageTagBy.mockResolvedValue(results)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, websitePageId } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id: websitePageId, websiteId })
    expect(selectWebsitePageTagBy).toBeCalledWith({ websitePageId })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, results)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error if website does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectWebsiteBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { websiteId } }))
      .rejects.toThrow(errorMessage)

    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageTagBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if page does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectWebsiteBy.mockResolvedValue(websiteId)
    selectWebsitePageBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, websitePageId } }))
      .rejects.toThrow(errorMessage)

    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id: websitePageId, websiteId })
    expect(selectWebsitePageTagBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
