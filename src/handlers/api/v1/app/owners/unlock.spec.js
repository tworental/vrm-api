const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { selectOneBy, updateById } = require('../../../../../models/v1/owners/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/mailing')
jest.mock('../../../../../models/v1/owners/repositories')

const httpHandler = require('./unlock')

describe('GET /v1/app/owners/:id/unlock', () => {
  const lang = 'en'
  const identifier = 'identifier'

  const id = 'id'
  const accountId = 'accountId'

  const req = {
    headers: { lang },
    account: { identifier },
    params: { id },
    user: { accountId },
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should lock an owners', async () => {
    const statusCode = 200
    const results = { id: 1, email: 'username@domain.com' }

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue(results)
    updateById.mockResolvedValue()
    sendMail.mockResolvedValue()

    await expect(httpHandler(req, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(updateById).toBeCalledWith(results.id, { lockedAt: null })
    expect(sendMail).toBeCalledWith('owners-unlocked', lang, results.email, {
      identifier,
    })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if owners does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler(req))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
