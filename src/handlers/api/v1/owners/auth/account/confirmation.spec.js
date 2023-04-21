const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneWithAccount, updateById } = require('../../../../../../models/v1/owners/repositories')
const { deleteBy: deleteTokenBy, checkToken } = require('../../../../../../models/v1/owner-tokens/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/owners/repositories')
jest.mock('../../../../../../models/v1/owner-tokens/repositories')

const httpHandler = require('./confirmation')

describe('account confirmation service', () => {
  const time = 1479427200000
  const email = 'johndoe@domain.com'
  const identifier = 'organization'
  const headers = {
    'x-org-id': identifier,
  }
  const token = 'token'

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => time)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should allow to confirm an account', async () => {
    const owner = {
      id: 1,
      confirmedAt: 1,
    }
    const ownerToken = 'owner-token'
    const results = 202

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectOneWithAccount.mockResolvedValue(owner)
    checkToken.mockResolvedValue(ownerToken)
    deleteTokenBy.mockResolvedValue(owner)

    await expect(httpHandler({ query: { email, token }, headers }, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(checkToken).toBeCalledWith(owner.id, token, 'confirmation')
    expect(deleteTokenBy).toBeCalledWith({ ownerId: owner.id, type: 'confirmation' })
    expect(sendStatus).toBeCalledWith(202)
  })

  it('should throw an error if a owner is not present', async () => {
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(null)

    await expect(httpHandler({ query: { email, token }, headers }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { token: ['invalid'] },
    })
  })

  it('should throw an error if a owner token is not present', async () => {
    const errorMessage = 'Invalid Credentials'
    const owner = {
      id: 1,
      confirmedAt: 1,
    }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(owner)
    checkToken.mockResolvedValue(null)

    await expect(httpHandler({ query: { email, token }, headers }))
      .rejects.toThrow(errorMessage)

    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { token: ['invalid'] },
    })
  })

  it('should set confirmation if not set', async () => {
    const owner = {
      id: 1,
      confirmedAt: null,
    }
    const ownerToken = 'owner-token'
    const results = 202

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectOneWithAccount.mockResolvedValue(owner)
    checkToken.mockResolvedValue(ownerToken)
    updateById.mockResolvedValue(owner)
    deleteTokenBy.mockResolvedValue(owner)

    await expect(httpHandler({ query: { email, token }, headers }, { sendStatus }))
      .resolves.toEqual(results)

    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(checkToken).toBeCalledWith(owner.id, token, 'confirmation')
    expect(updateById).toBeCalledWith(owner.id, {
      confirmedAt: new Date(time),
    })
    expect(deleteTokenBy).toBeCalledWith({ ownerId: owner.id, type: 'confirmation' })
    expect(sendStatus).toBeCalledWith(202)
  })
})
