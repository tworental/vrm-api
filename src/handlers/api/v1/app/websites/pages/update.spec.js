const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const {
  updateBy: updateWebsitePageBy,
  selectOneBy: selectWebsitePageBy,
} = require('../../../../../../models/v1/website-pages/repositories')
const {
  selectOneBy: selectWebsiteBy,
} = require('../../../../../../models/v1/websites/repositories')
const {
  create: createPageTag,
  deleteBy: deletePageTagBy,
} = require('../../../../../../models/v1/website-page-tags/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/website-pages/schema')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../models/v1/website-pages/repositories')
jest.mock('../../../../../../models/v1/websites/repositories')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/website-page-tags/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/websites/:websiteId/pages/:id', () => {
  const accountId = 'accountId'
  const websiteId = 'websiteId'
  const body = 'body'
  const id = 'pageId'
  const results = { id }
  const tags = [{ content: 'content', itemProp: 'itemProp' }, { content: 'content', itemProp: 'itemProp' }]
  const payload = {
    name: 'home',
    tags,
  }

  const req = {
    user: { accountId },
    params: { websiteId, id },
    body,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const statusCode = 200
    const trx = 'trx'

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockResolvedValue()
    createTransaction.mockImplementation((fn) => fn(trx))

    validate.mockResolvedValue(payload)
    selectWebsiteBy.mockResolvedValue(websiteId)
    selectWebsitePageBy.mockResolvedValue(id)
    selectWebsitePageBy.mockReturnValueOnce(results)
    selectWebsitePageBy.mockReturnValueOnce({ where })
    updateWebsitePageBy.mockResolvedValue(id)
    deletePageTagBy.mockResolvedValue(id)
    createPageTag.mockResolvedValue(id)

    await expect(httpHandler(req, { sendStatus })).resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectWebsiteBy).toHaveBeenNthCalledWith(1, { id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id, websiteId })
    expect(selectWebsitePageBy).toBeCalledWith({ websiteId, name: payload.name })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateWebsitePageBy).toBeCalledWith({ id }, { name: payload.name }, trx)
    expect(deletePageTagBy).toBeCalledWith({ websitePageId: id }, trx)
    expect(createPageTag).toBeCalledWith({ websitePageId: id, tag: tags[0] }, trx)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if website does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectWebsiteBy.mockResolvedValue(null)

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectWebsiteBy).toHaveBeenNthCalledWith(1, { id: websiteId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if website page does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectWebsiteBy.mockResolvedValue(websiteId)
    selectWebsitePageBy.mockResolvedValue(null)

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectWebsiteBy).toHaveBeenNthCalledWith(1, { id: websiteId, accountId })
    expect(selectWebsitePageBy).toBeCalledWith({ id, websiteId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
