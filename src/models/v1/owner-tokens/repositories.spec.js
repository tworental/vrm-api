const { randomBytes } = require('crypto')

const { select, insert, remove } = require('../../../services/database')

jest.mock('crypto')
jest.mock('../../../services/database')

const repository = require('./repositories')

describe('owner-token repositories', () => {
  const time = 1479427200000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => time)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('remove a owner-token based on the condition', async () => {
    const conditions = { id: 1 }
    const trx = 'transaction'
    const results = 'results'

    remove.mockResolvedValue(results)

    await expect(repository.deleteBy(conditions, trx)).resolves.toEqual(results)

    expect(remove).toBeCalledWith('owner_tokens', conditions, trx)
  })

  it('creates a owner-token', async () => {
    const results = 'results'
    const expiresAt = new Date(time + 86400000)
    const ownerId = 1
    const type = 'type'
    const trx = 'transaction'
    const token = 'token'
    const value = 'value'

    const toString = jest.fn().mockReturnValue(token)

    randomBytes.mockReturnValue({ toString })

    insert.mockResolvedValue(results)

    await expect(repository.createToken(ownerId, value, type, trx)).resolves.toEqual(token)

    expect(insert).toBeCalledWith('owner_tokens', {
      ownerId,
      type,
      token,
      value,
      expiresAt,
    }, trx)
  })

  it('check expiration of owner-token', async () => {
    const ownerId = 1
    const token = 'token'
    const type = 'type'
    const results = 'results'

    const first = jest.fn().mockResolvedValue(results)
    const whereRaw = jest.fn().mockReturnValue({ first })

    select.mockReturnValue({ whereRaw })

    await expect(repository.checkToken(ownerId, token, type)).resolves.toEqual(results)

    expect(select).toBeCalledWith('owner_tokens', { ownerId, type, token })
    expect(whereRaw).toBeCalledWith('expires_at >= NOW()')
    expect(first).toBeCalled()
  })
})
