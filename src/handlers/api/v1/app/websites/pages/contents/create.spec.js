const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { validate } = require('../../../../../../../services/validate')
const { sanitizePayload, createTransaction } = require('../../../../../../../services/database')
const {
  create: createWebsitePageContentBy,
  deleteBy,
} = require('../../../../../../../models/v1/website-page-contents/repositories')
const {
  selectOneBy: selectWebsitePageBy,
} = require('../../../../../../../models/v1/website-pages/repositories')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../../models/v1/websites/repositories')
const { CREATE_SCHEMA } = require('../../../../../../../models/v1/website-page-contents/schema')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../services/validate')
jest.mock('../../../../../../../models/v1/website-pages/repositories')
jest.mock('../../../../../../../models/v1/websites/repositories')
jest.mock('../../../../../../../services/database')
jest.mock('../../../../../../../models/v1/website-page-tags/repositories')
jest.mock('../../../../../../../models/v1/website-page-contents/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/websites/:websiteId/pages/:websitePageId/content', () => {
  const accountId = 'accountId'
  const websiteId = 'websiteId'
  const websitePageId = 'pageId'
  const body = 'body'
  const id = 'id'
  const payload = { html: 'html', css: 'css' }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const trx = 'trx'

    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })

    validate.mockResolvedValue(payload)
    selectWebsiteBy.mockResolvedValue(websiteId)
    selectWebsitePageBy.mockResolvedValue(websitePageId)
    createTransaction.mockImplementation((fn) => fn(trx))
    deleteBy.mockResolvedValue(websitePageId)
    sanitizePayload.mockImplementationOnce((data, callback) => callback(data, { id }, trx))
    createWebsitePageContentBy.mockResolvedValue(id)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, websitePageId }, body }, { status }))
      .resolves.toEqual({ data: { id } })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id: websitePageId, websiteId })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(deleteBy).toBeCalledWith({ websitePageId }, trx)
    expect(sanitizePayload).toBeCalledWith({ ...payload }, expect.any(Function))
    expect(createWebsitePageContentBy).toBeCalledWith({ websitePageId, ...payload }, trx)
    expect(status).toBeCalledWith(201)
    expect(json).toBeCalledWith({ data: { id } })
  })

  it('should throw an error if website does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectWebsiteBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { websiteId, websitePageId }, body }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if website page does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectWebsiteBy.mockResolvedValue(websitePageId)
    selectWebsitePageBy.mockResolvedValue()

    await expect(httpHandler({ user: { accountId }, params: { websiteId, websitePageId }, body }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id: websitePageId, websiteId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
