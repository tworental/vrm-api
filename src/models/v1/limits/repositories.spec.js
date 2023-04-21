const { queryBuilder, raw } = require('../../../services/database')

jest.mock('../../../services/database')

const repository = require('./repositories')

describe('limits repositories', () => {
  it('select a limit', async () => {
    const packageId = 1
    const accountId = 2
    const results = 'results'

    raw.mockImplementation((args) => args)

    const leftJoinLimitAccounts = jest.fn().mockResolvedValue(results)
    const leftJoinLimitPackages = jest.fn().mockReturnValue({
      leftJoin: leftJoinLimitAccounts,
    })
    const select = jest.fn().mockReturnValue({
      leftJoin: leftJoinLimitPackages,
    })

    const aliasPackages = jest.fn().mockReturnValue('limit_packages')
    const wherePackages = jest.fn().mockReturnValue({ as: aliasPackages })

    const aliasAccounts = jest.fn().mockReturnValue('limit_accounts')
    const whereAccounts = jest.fn().mockReturnValue({ as: aliasAccounts })

    queryBuilder.mockReturnValueOnce({ select })
    queryBuilder.mockReturnValueOnce({ where: wherePackages })
    queryBuilder.mockReturnValueOnce({ where: whereAccounts })

    await expect(repository.selectLimits({ accountId, packageId })).resolves.toEqual(results)

    expect(queryBuilder).toHaveBeenNthCalledWith(1, 'limits')
    expect(queryBuilder).toHaveBeenNthCalledWith(2, 'limit_packages')
    expect(queryBuilder).toHaveBeenNthCalledWith(3, 'limit_accounts')

    expect(select).toBeCalledWith([
      'name', 'IFNULL(limit_accounts.value, IFNULL(limit_packages.value, limits.value)) AS value',
    ])
    expect(leftJoinLimitPackages).toBeCalledWith('limit_packages', 'limits.id', 'limit_packages.limit_id')
    expect(leftJoinLimitAccounts).toBeCalledWith('limit_accounts', 'limits.id', 'limit_accounts.limit_id')
    expect(wherePackages).toBeCalledWith('package_id', '=', packageId)
    expect(whereAccounts).toBeCalledWith('account_id', '=', accountId)
  })

  const limits = [
    { name: 'key1', value: 'val1' },
    { name: 'key2', value: 'val2' },
  ]

  it('should get limit by key', () => {
    expect(repository.getLimitByKey('key1', limits))
      .toEqual('val1')
  })

  it('should return default value when no key matches', () => {
    expect(repository.getLimitByKey('some', limits, 'default'))
      .toEqual('default')
  })
})
