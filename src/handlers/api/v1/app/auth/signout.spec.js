const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')

const httpHandler = require('./signout')

describe('DELETE /v1/app/auth/signout', () => {
  it('should signout user successfully', () => {
    const statusCode = 200

    const id = 1
    const accountId = 100

    const sendStatus = jest.fn().mockImplementation((args) => args)

    expect(httpHandler({ user: { id, accountId } }, { sendStatus }))
      .toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(cache.del).toBeCalledWith(`accounts.${accountId}.users.${id}`)
    expect(sendStatus).toBeCalledWith(statusCode)
  })
})
