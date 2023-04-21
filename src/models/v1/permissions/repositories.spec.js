const { queryBuilder, raw } = require('../../../services/database')

jest.mock('../../../services/database')

const repository = require('./repositories')

describe('permissions repositories', () => {
  it('should select a permissions', async () => {
    const conditions = { userId: 1, accountId: 1 }
    const results = 'results'

    const leftJoin = jest.fn().mockResolvedValue(results)
    const select = jest.fn().mockReturnValue({ leftJoin })

    const as = jest.fn().mockImplementation((args) => args)
    const whereIn = jest.fn().mockReturnValue({ as })
    const where = jest.fn().mockReturnValue({ whereIn })

    raw.mockImplementation((args) => args)

    queryBuilder.mockReturnValueOnce({ select })
    queryBuilder.mockReturnValueOnce({ where })

    await expect(repository.selectBy(conditions))
      .resolves.toEqual(results)

    expect(queryBuilder).toHaveBeenNthCalledWith(1, 'permissions')
    expect(queryBuilder).toHaveBeenNthCalledWith(2, 'permission_users')

    expect(select).toBeCalledWith(
      'permissions.id',
      'permission_users.id AS permission_user_id',
      'permission_users.user_id',
      'name',
      'permission_users.abilities',
      'allow_read',
      'allow_write',
      'allow_delete',
    )
    expect(leftJoin).toBeCalledWith('permission_users', 'permissions.id', 'permission_users.permission_id')
    expect(raw).toBeCalledWith('permission_users.id AS permission_user_id')
    expect(where).toBeCalledWith({ accountId: conditions.accountId })
    expect(whereIn).toBeCalledWith('userId', [conditions.userId])
    expect(as).toBeCalledWith('permission_users')
  })
})
