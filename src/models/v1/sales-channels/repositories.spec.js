const { insert } = require('../../../services/database')
const dao = require('../../../services/dao')
const DEFAULT_FIXTURES = require('../../../__fixtures__/salesChannels')

jest.mock('../../../services/database')
jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('sales-channels repositories', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'sales_channels',
      methods: {
        createDefaults: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  it('should call createDefaults function', async () => {
    const accountId = 'accountId'
    const trx = 'trx'

    insert.mockResolvedValueOnce(1)
    insert.mockResolvedValueOnce(2)
    insert.mockResolvedValueOnce(3)

    await expect(repository.methods.createDefaults(accountId, trx))
      .resolves.toEqual([1, 2, 3])

    expect(insert).toBeCalledWith('sales_channels', { accountId, ...DEFAULT_FIXTURES[0] }, trx)
    expect(insert).toBeCalledWith('sales_channels', { accountId, ...DEFAULT_FIXTURES[1] }, trx)
    expect(insert).toBeCalledWith('sales_channels', { accountId, ...DEFAULT_FIXTURES[2] }, trx)
  })
})
