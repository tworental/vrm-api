const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const { selectOneBy, updateBy } = require('../../../../../models/v1/users/repositories')
const { setPermissions } = require('../../../../../models/v1/permission-users/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/users/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/mailing')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/database')
jest.mock('../../../../../models/v1/permission-users/repositories')
jest.mock('../../../../../models/v1/users/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/users/:id', () => {
  const account = { identifier: 'identifier' }
  const user = { id: 1, accountId: 2, isAccountOwner: true }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const id = 2
    const isAccountOwner = 1
    const trx = 'trx'
    const body = {}
    const headers = { lang: 'en' }
    const params = { id }
    const permissions = 'permissions'
    const member = {
      firstName: 'John', email: 'john.doe@domain.com',
    }
    const req = {
      body, headers, params, account, user,
    }

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockResolvedValue(member)

    createTransaction.mockImplementation((fn) => fn(trx))

    validate.mockResolvedValue({ isAccountOwner, permissions })
    selectOneBy.mockReturnValue({ where })
    updateBy.mockResolvedValue()
    setPermissions.mockResolvedValue()
    sendMail.mockResolvedValue()

    await expect(httpHandler(req, { sendStatus })).resolves.toBe(200)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ id })
    expect(where).toBeCalledWith('id', '!=', user.id)
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateBy).toBeCalledWith({ accountId: user.accountId }, { isAccountOwner: 0 }, trx)
    expect(updateBy).toBeCalledWith({ id, accountId: user.accountId }, { isAccountOwner: 1 }, trx)
    expect(setPermissions).toBeCalledWith(user.accountId, id, permissions, trx)

    expect(sendMail).toBeCalledWith('users-change-account-owner', 'en', member.email, {
      firstName: member.firstName,
      email: user.email,
      identifier: account.identifier,
      isAccountOwner,
    })
    expect(sendStatus).toBeCalledWith(200)
  })

  it('should thrown an error when user is not an owner role', async () => {
    const errorMessage = 'Forbidden'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const req = {
      user: { isAccountOwner: false },
      account,
      headers: { },
      params: { },
    }

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(403, errorMessage, { code: 'FORBIDDEN' })
  })

  it('should thrown an error when user try update him self', async () => {
    const errorMessage = 'Forbidden'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const req = {
      user,
      account,
      headers: { },
      params: { id: 1 },
    }

    await expect(httpHandler(req))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(403, errorMessage, { code: 'FORBIDDEN' })
    expect(validate).not.toBeCalled()
  })

  it('should thrown an error when member could not be found', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const req = {
      user,
      account,
      headers: { },
      params: { id: 2 },
    }

    const where = jest.fn().mockResolvedValue(null)

    selectOneBy.mockReturnValue({ where })

    await expect(httpHandler(req))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
    expect(validate).not.toBeCalled()
  })
})
