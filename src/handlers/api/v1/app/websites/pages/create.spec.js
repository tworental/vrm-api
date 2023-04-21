const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const {
  create: createWebsitePage,
  selectOneBy: selectWebsitePageBy,
} = require('../../../../../../models/v1/website-pages/repositories')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/website-pages/schema')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../models/v1/websites/repositories')
const {
  create: createWebsitePageTag,
} = require('../../../../../../models/v1/website-page-tags/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../models/v1/website-pages/repositories')
jest.mock('../../../../../../models/v1/websites/repositories')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/website-page-tags/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/websites/:websiteId/pages', () => {
  const websiteId = 'websiteId'
  const body = 'body'
  const id = 'pageId'
  const accountId = 'accountId'
  const tags = [{ content: 'content', itemProp: 'itemProp' }]
  const payload = {
    name: 'home',
    tags,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const trx = 'trx'

    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })
    createTransaction.mockImplementation((fn) => fn(trx))

    validate.mockResolvedValue(payload)
    selectWebsiteBy.mockResolvedValue(websiteId)
    createWebsitePage.mockResolvedValue(id)
    createWebsitePageTag.mockResolvedValue(id)

    await expect(httpHandler({ user: { accountId }, params: { websiteId }, body }, { status }))
      .resolves.toEqual({ data: { id } })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ websiteId, name: payload.name })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(createWebsitePage).toBeCalledWith({ websiteId, name: payload.name }, trx)
    expect(createWebsitePageTag).toBeCalledWith({ websitePageId: id, tag: tags[0] }, trx)
    expect(status).toBeCalledWith(201)
    expect(json).toBeCalledWith({ data: { id } })
  })

  it('should throw an error when resource with the same name already exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectWebsiteBy.mockResolvedValueOnce(websiteId)
    selectWebsitePageBy.mockResolvedValue(websiteId)

    await expect(httpHandler({ user: { accountId }, params: { websiteId }, body }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ websiteId, name: payload.name })
    expect(createWebsitePage).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { name: ['unique'] },
    })
  })

  it('should throw an error if website does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectWebsiteBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { websiteId }, body }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectWebsiteBy).toBeCalledWith({ id: websiteId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
