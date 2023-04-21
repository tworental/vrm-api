const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const {
  uploadFile,
  selectOneBy,
  create,
  updateBy,
} = require('../../../../../models/v1/customer-contacts/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/customer-contacts/schema')

jest.mock('../../../../../services/http')
jest.mock('../../../../../services/database')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/errors')
jest.mock('../../../../../models/v1/customer-contacts/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/customer-contacts', () => {
  const accountId = 'accountId'
  const trx = 'trx'
  const id = 'id'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const payload = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email@email.com',
      primaryPhoneNumber: '+8989898989',
      additionalPhoneNumber: null,
      parlance: ['en'],
      isDefault: 0,
      bio: 'some notes',
    }

    const files = {}

    const results = { data: { id } }

    const json = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(payload)
    createTransaction.mockImplementation((fn) => fn(trx))
    create.mockResolvedValue(id)

    await expect(httpHandler({ user: { accountId }, body: payload, files }, { json }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(payload, { schema: CREATE_SCHEMA })
    expect(json).toBeCalledWith(results)
    expect(selectOneBy).toBeCalledWith({ accountId, email: payload.email })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateBy).not.toBeCalled()
    expect(create).toBeCalledWith({ ...payload, accountId }, trx)
  })

  it('should create a resource with uploading file', async () => {
    const url = 'file_url'

    const payload = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email@email.com',
      primaryPhoneNumber: '+8989898989',
      additionalPhoneNumber: null,
      parlance: ['en'],
      isDefault: 0,
      bio: 'some notes',
    }

    const files = { avatar: true }

    const results = { data: { id } }

    const json = jest.fn().mockImplementation((args) => args)
    const uploadFileFn = jest.fn().mockResolvedValue({ url })

    validate.mockResolvedValue(payload)
    createTransaction.mockImplementation((fn) => fn(trx))
    uploadFile.mockReturnValue(uploadFileFn)
    create.mockResolvedValue(id)

    await expect(httpHandler({ user: { accountId }, body: payload, files }, { json }))
      .resolves.toEqual(results)

    expect(validate).toBeCalledWith(payload, { schema: CREATE_SCHEMA })
    expect(json).toBeCalledWith(results)
    expect(selectOneBy).toBeCalledWith({ accountId, email: payload.email })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(uploadFile).toBeCalledWith(files.avatar, null, { acl: 'public-read' })
    expect(uploadFileFn).toBeCalledWith(accountId)
    expect(create).toBeCalledWith({ ...payload, accountId }, trx)
  })

  it('should throw unprocessable error if a file is not uploaded', async () => {
    const errorMessage = 'Unprocessable Entity'

    const payload = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email@email.com',
      primaryPhoneNumber: '+8989898989',
      additionalPhoneNumber: null,
      parlance: ['en'],
      isDefault: 0,
      bio: 'some notes',
    }

    const files = { avatar: true }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const uploadFileFn = jest.fn().mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    createTransaction.mockImplementation((fn) => fn(trx))
    uploadFile.mockReturnValue(uploadFileFn)
    create.mockResolvedValue(id)

    await expect(httpHandler({ user: { accountId }, body: payload, files }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(payload, { schema: CREATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId, email: payload.email })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(uploadFile).toBeCalledWith(files.avatar, null, { acl: 'public-read' })
    expect(uploadFileFn).toBeCalledWith(accountId)
    expect(createError).toBeCalledWith(422, errorMessage, {
      code: 'UNPROCESSABLE_ENTITY',
    })
  })

  it('should create a resource with updating another resources', async () => {
    const payload = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email@email.com',
      primaryPhoneNumber: '+8989898989',
      additionalPhoneNumber: null,
      parlance: ['en'],
      isDefault: 1,
      bio: 'some notes',
    }

    const files = {}

    const results = { data: { id } }

    const json = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(payload)
    createTransaction.mockImplementation((fn) => fn(trx))
    create.mockResolvedValue(id)

    await expect(httpHandler({ user: { accountId }, body: payload, files }, { json }))
      .resolves.toEqual(results)

    expect(validate).toBeCalledWith(payload, { schema: CREATE_SCHEMA })
    expect(json).toBeCalledWith(results)
    expect(selectOneBy).toBeCalledWith({ accountId, email: payload.email })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateBy).toBeCalledWith({ accountId }, { isDefault: 0 }, trx)
    expect(create).toBeCalledWith({ ...payload, accountId }, trx)
  })

  it('should throw an error when resource exists', async () => {
    const errorMessage = 'Validation Failed'

    const payload = { email: 'email' }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValue(true)

    await expect(httpHandler({ user: { accountId }, body: payload, files: {} }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(payload, { schema: CREATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId, email: payload.email })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { email: ['exists'] },
    })
  })
})
