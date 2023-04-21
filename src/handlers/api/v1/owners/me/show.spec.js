const { handler } = require('../../../../../services/http')
const { serialize } = require('../../../../../models/v1/users/serializers')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/users/serializers')

const httpHandler = require('./show')

describe('GET /v1/owners/me', () => {
  it('should return details of logged in user', async () => {
    const user = 'user'
    const response = { data: user }

    serialize.mockResolvedValue(user)
    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
    expect(serialize).toBeCalledWith(user)
  })
})
