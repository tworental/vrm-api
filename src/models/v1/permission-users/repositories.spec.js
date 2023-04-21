const { insert, update } = require('../../../services/database')
const { selectBy } = require('../permissions/repositories')

jest.mock('../../../services/database')
jest.mock('../permissions/repositories')

const repository = require('./repositories')

describe('permission-users repositories', () => {
  const trx = 'trx'
  const accountId = 1
  const userId = 1000
  const data = [
    { name: 'module.1', abilities: ['scope'] },
    { name: 'module.2', abilities: ['scope'] },
    { name: 'wrong.module', abilities: null },
  ]

  it('should create permissions for the user', async () => {
    const results = [
      { id: 1, permissionUserId: null, name: 'module.1' },
      { id: 2, permissionUserId: 5000, name: 'module.2' },
    ]

    const where = jest.fn().mockResolvedValue(results)

    selectBy.mockReturnValue({ where })

    await expect(repository.setPermissions(accountId, userId, data, trx))
      .resolves.toEqual([undefined, undefined])

    expect(selectBy).toBeCalledWith({ accountId, userId })
    expect(where).toBeCalledWith('name', 'IN', ['module.1', 'module.2', 'wrong.module'])
    expect(insert).toBeCalledWith('permission_users', {
      id: null,
      permissionId: 1,
      abilities: '["scope"]',
      accountId,
      userId,
    }, trx)

    expect(update).toBeCalledWith('permission_users', {
      id: 5000,
      permissionId: 2,
      abilities: '["scope"]',
      accountId,
      userId,
    }, { id: 5000 }, trx)
  })
})
