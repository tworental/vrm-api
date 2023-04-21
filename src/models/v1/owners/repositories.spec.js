const { v4: uuidv4 } = require('uuid')
const { compare, hash } = require('bcryptjs')

const {
  insert, update, select, selectOne,
} = require('../../../services/database')
const { applyToFields, convertToJsonString } = require('../../../services/serializers')

jest.mock('uuid')
jest.mock('bcryptjs')
jest.mock('../../../services/database')
jest.mock('../../../services/serializers')

const repository = require('./repositories')

describe('owners repositories', () => {
  const time = 1479427200000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => time)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should generate avatar path', () => {
    uuidv4.mockReturnValue('uuid')

    expect(repository.generateAvatarPath('accountId', 'id', { name: 'fileName.jpg' }))
      .toEqual('accountId/owners/id/uuid.jpg')
  })

  it('should generate a password', async () => {
    const password = 'password'
    const results = 'hash'

    hash.mockResolvedValue(results)

    await expect(repository.generatePassword(password)).resolves.toEqual(results)

    expect(hash).toBeCalledWith(password, 12)
  })

  it('should create a new owner', async () => {
    const data = {
      email: 'johndoe@domain.com',
      password: 'pa$$word',
    }
    const trx = 'transaction'
    const results = 'results'
    const encryptedPassword = 'encryptedPassword'
    const transformedData = { key: 'value' }

    insert.mockResolvedValue(results)

    const generatePassword = jest.spyOn(repository, 'generatePassword').mockReturnValue(encryptedPassword)

    applyToFields.mockReturnValue(transformedData)
    await expect(repository.create(data, trx)).resolves.toEqual(results)

    expect(generatePassword).toBeCalledWith(data.password)
    expect(applyToFields).toBeCalledWith(convertToJsonString, ['parlance'], { email: data.email })
    expect(insert).toBeCalledWith('owners', {
      ...transformedData,
      encryptedPassword,
    }, trx)
  })

  it('should update owner for the given id', async () => {
    const data = {
      email: 'johndoe@domain.com',
      password: 'pa$$word',
    }

    const id = 1
    const trx = 'transaction'
    const results = 'results'
    const encryptedPassword = 'encryptedPassword'
    const transformedData = { key: 'value' }

    const generatePassword = jest.spyOn(repository, 'generatePassword').mockReturnValue(encryptedPassword)

    const whereNull = jest.fn().mockResolvedValue(results)

    applyToFields.mockReturnValue(transformedData)
    update.mockReturnValue({ whereNull })

    await expect(repository.updateBy({ id }, data, trx)).resolves.toEqual(results)

    expect(generatePassword).toBeCalledWith(data.password)
    expect(applyToFields).toBeCalledWith(convertToJsonString, ['parlance'], {
      email: data.email,
      encryptedPassword,
    })
    expect(update).toBeCalledWith('owners', transformedData, { id }, trx)
    expect(whereNull).toBeCalledWith('owners.deletedAt')
  })

  it('should select all owners based on the given condition', async () => {
    const condition = { id: 1 }
    const trx = 'transaction'
    const results = 'results'

    const whereNull = jest.fn().mockResolvedValue(results)

    select.mockReturnValue({ whereNull })

    await expect(repository.selectBy(condition, trx)).resolves.toEqual(results)

    expect(select).toBeCalledWith('owners', condition, trx)
    expect(whereNull).toBeCalledWith('owners.deletedAt')
  })

  it('should select an owner based on the given condition', async () => {
    const condition = { id: 1 }
    const trx = 'transaction'
    const results = 'results'

    const whereNull = jest.fn().mockResolvedValue(results)

    selectOne.mockReturnValue({ whereNull })

    await expect(repository.selectOneBy(condition, trx)).resolves.toEqual(results)

    expect(selectOne).toBeCalledWith('owners', condition, trx)
    expect(whereNull).toBeCalledWith('owners.deletedAt')
  })

  it('should soft delete owners based on the given condition', async () => {
    const condition = { id: 1 }
    const trx = 'transaction'
    const results = 'results'

    const whereNull = jest.fn().mockResolvedValue(results)

    update.mockReturnValue({ whereNull })

    await expect(repository.deleteBy(condition, trx)).resolves.toEqual(results)

    expect(update).toBeCalledWith('owners', { deletedAt: new Date(time) }, condition, trx)
    expect(whereNull).toBeCalledWith('owners.deletedAt')
  })

  it('should select an owner based on the given condition', async () => {
    const condition = { id: 1 }
    const trx = 'transaction'
    const results = 'results'

    const whereNull = jest.fn().mockResolvedValue(results)
    const join = jest.fn().mockReturnValue({ whereNull })

    const selectOneFn = jest.spyOn(repository, 'selectOneBy').mockReturnValue({ join })

    await expect(repository.selectOneWithAccount(condition, trx)).resolves.toEqual(results)

    expect(selectOneFn).toBeCalledWith(condition, trx)
    expect(join).toBeCalledWith('accounts', 'accounts.id', '=', 'owners.account_id')
    expect(whereNull).toBeCalledWith('accounts.deletedAt')
  })

  it('should verify the enterd password', async () => {
    const owner = { encryptedPassword: 'hash' }
    const password = 'pa$$word'
    const results = 'results'

    compare.mockResolvedValue(results)

    await expect(repository.verifyPassword(owner, password)).resolves.toEqual(results)

    expect(compare).toBeCalledWith(password, owner.encryptedPassword)
  })
})
