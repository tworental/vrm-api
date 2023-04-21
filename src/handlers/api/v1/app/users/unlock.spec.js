const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { selectOneBy, updateById } = require('../../../../../models/v1/users/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/mailing')
jest.mock('../../../../../models/v1/users/repositories')

const httpHandler = require('./unlock')

describe('GET /v1/app/users/:id/unlock', () => {
  const lang = 'en'
  const identifier = 'identifier'

  const loggedUser = {
    id: 'id',
    isAccountOwner: 1,
    accountId: 'accountId',
    email: 'johdoe@domain.com',
  }

  const req = {
    headers: { lang },
    account: { identifier },
    params: { id: 1000 },
    user: loggedUser,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should lock an user', async () => {
    const statusCode = 200
    const results = { id: 1, email: 'username@domain.com' }

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockResolvedValue(results)

    selectOneBy.mockReturnValue({ where })
    updateById.mockResolvedValue()
    sendMail.mockResolvedValue()

    await expect(httpHandler(req, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(where).toBeCalledWith('id', '!=', loggedUser.id)
    expect(selectOneBy).toBeCalledWith({ accountId: loggedUser.accountId, id: 1000 })
    expect(updateById).toBeCalledWith(results.id, { lockedAt: null })
    expect(sendMail).toBeCalledWith('users-unlocked', lang, results.email, {
      identifier,
    })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if user does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockResolvedValue(null)
    selectOneBy.mockReturnValue({ where })

    await expect(httpHandler(req))
      .rejects.toThrow(errorMessage)

    expect(where).toBeCalledWith('id', '!=', loggedUser.id)
    expect(selectOneBy).toBeCalledWith({ accountId: loggedUser.accountId, id: 1000 })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
