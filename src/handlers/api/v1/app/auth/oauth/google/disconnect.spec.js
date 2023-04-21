const { handler } = require('../../../../../../../services/http')
const createError = require('../../../../../../../services/errors')
const cache = require('../../../../../../../services/cacheManager')
const {
  selectOneBy: selectUserBy,
  updateById: updateUserById,
} = require('../../../../../../../models/v1/users/repositories')

jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/errorCodes')
jest.mock('../../../../../../../services/cacheManager')
jest.mock('../../../../../../../models/v1/users/repositories')

const httpHandler = require('./disconnect')

describe('DELETE /v1/app/auth/oauth/google/disconnect', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should disconnect google', async () => {
    const identifier = 'identifier'
    const userId = 1
    const accountId = 1

    const headers = { 'x-org-id': identifier }

    selectUserBy.mockResolvedValue({ id: userId })

    const sendStatus = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ headers, user: { id: userId, accountId } }, { sendStatus }))
      .resolves.toEqual(204)

    expect(handler).toBeCalled()
    expect(sendStatus).toBeCalledWith(204)
    expect(selectUserBy).toBeCalledWith({ id: userId, accountId })
    expect(updateUserById).toBeCalledWith(userId, { oauth2GoogleId: null })
    expect(cache.del).toBeCalledWith([
      'accounts.1.*',
      'accounts.identifier.*',
    ])
  })

  it('should throw an error if user does not exist', async () => {
    const errorMessage = 'Not Found'
    const identifier = 'identifier'
    const userId = 1
    const accountId = 1

    const headers = { 'x-org-id': identifier }

    selectUserBy.mockResolvedValue(null)
    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const sendStatus = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ headers, user: { id: userId, accountId } }, { sendStatus }))
      .rejects.toThrow(errorMessage)

    expect(sendStatus).not.toBeCalled()
    expect(selectUserBy).toBeCalledWith({ id: userId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
