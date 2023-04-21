const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { selectOneBy, updateById } = require('../../../../../models/v1/owners/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/mailing')
jest.mock('../../../../../models/v1/owners/repositories')

const httpHandler = require('./lock')

describe('GET /v1/app/owners/:id/lock', () => {
  const lang = 'en'
  const identifier = 'identifier'
  const time = 1479427200000

  const id = 'id'
  const accountId = 'accountId'
  const email = 'email'

  const req = {
    headers: { lang },
    account: { identifier },
    params: { id },
    user: { accountId, email },
  }

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => time)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should lock an owner', async () => {
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
    expect(updateById).toBeCalledWith(results.id, { lockedAt: new Date(time) })
    expect(sendMail).toBeCalledWith('owners-locked', lang, results.email, {
      email,
      identifier,
    })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if owner does not exists', async () => {
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
