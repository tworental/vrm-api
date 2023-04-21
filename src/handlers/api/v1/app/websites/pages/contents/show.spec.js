const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../../models/v1/website-page-contents/serializers')
const {
  selectOneBy: selectWebsitePageContentBy,
} = require('../../../../../../../models/v1/website-page-contents/repositories')
const {
  selectOneBy: selectWebsitePageBy,
} = require('../../../../../../../models/v1/website-pages/repositories')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../../models/v1/websites/repositories')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../models/v1/website-page-contents/serializers')
jest.mock('../../../../../../../models/v1/website-page-contents/repositories')
jest.mock('../../../../../../../models/v1/website-pages/repositories')
jest.mock('../../../../../../../models/v1/websites/repositories')

const httpHandler = require('./show')

describe('GET /v1/app/websites/:websiteId/pages/:id', () => {
  const accountId = 'accountId'
  const websiteId = 'websiteId'
  const websitePageId = 'websitePageId'
  const id = 'id'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const data = { id }
    const content = 'content'

    const json = jest.fn().mockImplementation((args) => args)

    selectWebsiteBy.mockResolvedValue(websiteId)
    selectWebsitePageBy.mockResolvedValue(websitePageId)
    selectWebsitePageContentBy.mockResolvedValue(content)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, websitePageId, id } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id: websitePageId, websiteId })
    expect(selectWebsitePageContentBy).toBeCalledWith({ id, websitePageId })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, content)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error if website does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectWebsiteBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, websitePageId } }))
      .rejects.toThrow(errorMessage)

    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if website page does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectWebsiteBy.mockResolvedValue(websitePageId)
    selectWebsitePageBy.mockResolvedValue()

    await expect(httpHandler({ user: { accountId }, params: { websiteId, websitePageId } }))
      .rejects.toThrow(errorMessage)

    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id: websitePageId, websiteId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
