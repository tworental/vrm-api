const { handler } = require('../../../../../../services/http')
const createError = require('../../../../../../services/errors')
const { selectBy: selectWebsitePageBy } = require('../../../../../../models/v1/website-pages/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/website-pages/serializers')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../models/v1/websites/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/website-pages/repositories')
jest.mock('../../../../../../models/v1/website-pages/serializers')
jest.mock('../../../../../../models/v1/websites/repositories')

const httpHandler = require('./list')

describe('GET /v1/app/websites/:websiteId/pages', () => {
  const data = ['page']
  const results = 'pages'
  const websiteId = 'websiteId'
  const accountId = 'accountId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const json = jest.fn().mockImplementation((args) => args)

    selectWebsiteBy.mockResolvedValue(websiteId)
    selectWebsitePageBy.mockResolvedValue(results)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { websiteId } }, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ websiteId })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, results)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error if website does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectWebsiteBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { websiteId } })).rejects.toThrow(errorMessage)

    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
