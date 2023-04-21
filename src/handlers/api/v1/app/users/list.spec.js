const { handler } = require('../../../../../services/http')
const { selectBy: selectUsersBy } = require('../../../../../models/v1/users/repositories')
const { selectBy: selectPermissionsBy } = require('../../../../../models/v1/permissions/repositories')
const { serialize } = require('../../../../../models/v1/users/serializers')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/users/repositories')
jest.mock('../../../../../models/v1/permissions/repositories')
jest.mock('../../../../../models/v1/users/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/users', () => {
  it('should display all resources', async () => {
    const user = { id: 1, accountId: 1000 }
    const results = [
      { id: 1, name: 'user1' },
      { id: 2, name: 'user2' },
    ]
    const data = ['user1', 'user2']
    const response = { data }

    const json = jest.fn().mockImplementation((args) => args)

    const where = jest.fn().mockResolvedValue(results)
    selectUsersBy.mockReturnValue({ where })

    selectPermissionsBy.mockResolvedValue([
      {
        id: 1,
        permissionUserId: 5,
        userId: 1,
        name: 'users',
        abilities: ['read'],
      },
      {
        id: 2,
        permissionUserId: null,
        userId: null,
        name: 'account',
        abilities: ['read', 'write'],
      },
    ])

    serialize.mockResolvedValueOnce('user1')
    serialize.mockResolvedValueOnce('user2')

    await expect(httpHandler({ user }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(where).toBeCalledWith('id', '!=', 1)
    expect(selectUsersBy).toBeCalledWith({ accountId: 1000 })
    expect(selectPermissionsBy).toBeCalledWith({ accountId: 1000, userId: [1, 2] })
    expect(serialize).toHaveBeenNthCalledWith(1, results[0], {
      permissions: {
        account: ['read', 'write'],
        users: ['read'],
      },
    })
    expect(serialize).toHaveBeenNthCalledWith(2, results[1], {
      permissions: {
        account: ['read', 'write'],
      },
    })
    expect(json).toBeCalledWith(response)
  })
})
