const { v4: uuidv4 } = require('uuid')
const { compare, hash } = require('bcryptjs')

const {
  raw, insert, update, select, selectOne,
} = require('../../../services/database')

jest.mock('uuid')
jest.mock('bcryptjs')
jest.mock('../../../services/database')

const repository = require('./repositories')

describe('users repositories', () => {
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
      .toEqual('accountId/users/id/uuid.jpg')
  })

  it('should generate a password', async () => {
    const password = 'password'
    const results = 'hash'

    hash.mockResolvedValue(results)

    await expect(repository.generatePassword(password)).resolves.toEqual(results)

    expect(hash).toBeCalledWith(password, 12)
  })

  it('should create a new user', async () => {
    const data = {
      email: 'johndoe@domain.com',
      password: 'pa$$word',
    }
    const trx = 'transaction'
    const results = 'results'
    const encryptedPassword = 'hash'

    insert.mockResolvedValue(results)

    const generatePassword = jest.spyOn(repository, 'generatePassword').mockResolvedValue(encryptedPassword)

    await expect(repository.create(data, trx)).resolves.toEqual(results)

    expect(generatePassword).toBeCalledWith(data.password)
    expect(insert).toBeCalledWith('users', {
      email: data.email,
      encryptedPassword,
    }, trx)
  })

  it('should update data by conditions', async () => {
    const condtitions = { id: 1 }
    const trx = 'transaction'
    const results = 'results'
    const encryptedPassword = 'hash'
    const data = {
      email: 'johndoe@domain.com',
    }

    const generatePassword = jest.spyOn(repository, 'generatePassword')
      .mockResolvedValue(encryptedPassword)

    const whereNull = jest.fn().mockResolvedValue(results)

    update.mockReturnValue({ whereNull })

    await expect(repository.updateBy(condtitions, data, trx)).resolves.toEqual(results)

    expect(generatePassword).not.toBeCalled()
    expect(update).toBeCalledWith('users', data, condtitions, trx)
    expect(whereNull).toBeCalledWith('users.deletedAt')
  })

  it('should update data with password by conditions', async () => {
    const condtitions = { id: 1 }
    const trx = 'transaction'
    const results = 'results'
    const encryptedPassword = 'hash'
    const data = {
      email: 'johndoe@domain.com',
      password: 'pa$$word',
    }

    const generatePassword = jest.spyOn(repository, 'generatePassword')
      .mockResolvedValue(encryptedPassword)

    const whereNull = jest.fn().mockResolvedValue(results)

    update.mockReturnValue({ whereNull })

    await expect(repository.updateBy(condtitions, data, trx)).resolves.toEqual(results)

    expect(generatePassword).toBeCalledWith(data.password)
    expect(update).toBeCalledWith('users', { email: data.email, encryptedPassword }, condtitions, trx)
    expect(whereNull).toBeCalledWith('users.deletedAt')
  })

  it('should update data for the given id', async () => {
    const id = 1
    const trx = 'transaction'
    const results = 'results'
    const data = {
      email: 'johndoe@domain.com',
      password: 'pa$$word',
    }

    const updateBy = jest.spyOn(repository, 'updateBy').mockResolvedValue(results)

    await expect(repository.updateById(id, data, trx)).resolves.toEqual(results)

    expect(updateBy).toBeCalledWith({ id }, data, trx)
  })

  it('should select all elements based on the given condition', async () => {
    const condition = { id: 1 }
    const trx = 'transaction'
    const results = 'results'

    const whereNull = jest.fn().mockResolvedValue(results)

    select.mockReturnValue({ whereNull })

    await expect(repository.selectBy(condition, trx)).resolves.toEqual(results)

    expect(select).toBeCalledWith('users', condition, trx)
    expect(whereNull).toBeCalledWith('users.deletedAt')
  })

  it('should select one element based on the given condition', async () => {
    const condition = { id: 1 }
    const trx = 'transaction'
    const results = 'results'

    const whereNull = jest.fn().mockResolvedValue(results)
    const selectMock = jest.fn().mockReturnValue({ whereNull })

    raw.mockImplementation((args) => args)

    selectOne.mockReturnValue({ select: selectMock })

    await expect(repository.selectOneBy(condition, trx)).resolves.toEqual(results)

    expect(selectOne).toBeCalledWith('users', condition, trx)
    expect(raw).toBeCalledWith('TRIM(CONCAT(IFNULL(first_name, ""), " ", IFNULL(last_name, ""))) AS full_name')
    expect(selectMock).toBeCalledWith('TRIM(CONCAT(IFNULL(first_name, ""), " ", IFNULL(last_name, ""))) AS full_name')
    expect(whereNull).toBeCalledWith('users.deletedAt')
  })

  it('should soft delete elements based on the given condition', async () => {
    const condition = { id: 1 }
    const trx = 'transaction'
    const results = 'results'

    const whereNull = jest.fn().mockResolvedValue(results)

    update.mockReturnValue({ whereNull })

    await expect(repository.deleteBy(condition, trx)).resolves.toEqual(results)

    expect(update).toBeCalledWith('users', { deletedAt: new Date(time) }, condition, trx)
    expect(whereNull).toBeCalledWith('users.deletedAt')
  })

  it('should select an account based on the given condition', async () => {
    const condition = { id: 1 }
    const trx = 'transaction'
    const results = 'results'

    const whereNull = jest.fn().mockResolvedValue(results)
    const join = jest.fn().mockReturnValue({ whereNull })

    const selectOneFn = jest.spyOn(repository, 'selectOneBy').mockReturnValue({ join })

    await expect(repository.selectOneWithAccount(condition, trx)).resolves.toEqual(results)

    expect(selectOneFn).toBeCalledWith(condition, trx)
    expect(join).toBeCalledWith('accounts', 'accounts.id', '=', 'users.account_id')
    expect(whereNull).toBeCalledWith('accounts.deletedAt')
  })

  it('should verify the enterd password', async () => {
    const user = { encryptedPassword: 'hash' }
    const password = 'pa$$word'
    const results = 'results'

    compare.mockResolvedValue(results)

    await expect(repository.verifyPassword(user, password)).resolves.toEqual(results)

    expect(compare).toBeCalledWith(password, user.encryptedPassword)
  })
})
