const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const {
  uploadFile,
  selectOneBy,
  updateBy,
} = require('../../../../../models/v1/customer-contacts/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/customer-contacts/schema')

jest.mock('../../../../../services/http')
jest.mock('../../../../../services/database')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/errors')
jest.mock('../../../../../models/v1/customer-contacts/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/customer-contacts/:id', () => {
  const accountId = 'accountId'
  const trx = 'trx'
  const id = 'id'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const statusCode = 204

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

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockResolvedValue(null)

    validate.mockResolvedValue(payload)
    createTransaction.mockImplementation((fn) => fn(trx))
    selectOneBy.mockResolvedValueOnce({ id })
    selectOneBy.mockReturnValueOnce({ where })

    await expect(httpHandler({
      user: { accountId }, body: payload, files, params: { id },
    }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(payload, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectOneBy).toHaveBeenNthCalledWith(2, { accountId, email: payload.email })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateBy).toHaveBeenNthCalledWith(1, { accountId, id }, { ...payload, accountId }, trx)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should update a resource with uploading file', async () => {
    const statusCode = 204
    const url = 'url'

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

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockResolvedValue(null)
    const uploadFileFn = jest.fn().mockResolvedValue({ url })

    validate.mockResolvedValue(payload)
    createTransaction.mockImplementation((fn) => fn(trx))
    selectOneBy.mockResolvedValueOnce({ id, avatar: 'contact-avatar' })
    selectOneBy.mockReturnValueOnce({ where })
    uploadFile.mockReturnValue(uploadFileFn)

    await expect(httpHandler({
      user: { accountId }, body: payload, files, params: { id },
    }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(validate).toBeCalledWith(payload, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectOneBy).toHaveBeenNthCalledWith(2, { accountId, email: payload.email })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(uploadFile).toBeCalledWith(files.avatar, 'contact-avatar', { acl: 'public-read' })
    expect(uploadFileFn).toBeCalledWith(accountId)
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateBy).toHaveBeenNthCalledWith(1, { accountId, id }, { ...payload, accountId }, trx)
    expect(sendStatus).toBeCalledWith(statusCode)
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

    const where = jest.fn().mockResolvedValue(null)
    const uploadFileFn = jest.fn().mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    createTransaction.mockImplementation((fn) => fn(trx))
    selectOneBy.mockResolvedValueOnce({ id, avatar: 'contact-avatar' })
    selectOneBy.mockReturnValueOnce({ where })

    uploadFile.mockReturnValue(uploadFileFn)

    await expect(httpHandler({
      user: { accountId }, body: payload, files, params: { id },
    }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(payload, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectOneBy).toHaveBeenNthCalledWith(2, { accountId, email: payload.email })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(uploadFile).toBeCalledWith(files.avatar, 'contact-avatar', { acl: 'public-read' })
    expect(uploadFileFn).toBeCalledWith(accountId)
    expect(createError).toBeCalledWith(422, errorMessage, {
      code: 'UNPROCESSABLE_ENTITY',
    })
  })

  it('should update a resource with updating another resources', async () => {
    const statusCode = 204

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

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockResolvedValue(null)

    validate.mockResolvedValue(payload)
    createTransaction.mockImplementation((fn) => fn(trx))
    selectOneBy.mockResolvedValueOnce({ id })
    selectOneBy.mockReturnValueOnce({ where })

    await expect(httpHandler({
      user: { accountId }, body: payload, files, params: { id },
    }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(validate).toBeCalledWith(payload, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectOneBy).toHaveBeenNthCalledWith(2, { accountId, email: payload.email })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateBy).toHaveBeenNthCalledWith(1, { accountId }, { isDefault: 0 }, trx)
    expect(updateBy).toHaveBeenNthCalledWith(2, { accountId, id }, { ...payload, accountId }, trx)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    const payload = { email: 'email' }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    createTransaction.mockImplementation((fn) => fn(trx))
    selectOneBy.mockResolvedValueOnce(null)

    await expect(httpHandler({
      user: { accountId }, body: payload, files: {}, params: { id },
    }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })

  it('should throw an error when another resource exists with the same name', async () => {
    const errorMessage = 'Validation Failed'

    const payload = { email: 'email' }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockResolvedValue({ id })

    validate.mockResolvedValue(payload)
    createTransaction.mockImplementation((fn) => fn(trx))
    selectOneBy.mockResolvedValueOnce({ id })
    selectOneBy.mockReturnValueOnce({ where })

    await expect(httpHandler({
      user: { accountId }, body: payload, files: {}, params: { id },
    }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(payload, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectOneBy).toHaveBeenNthCalledWith(2, { accountId, email: payload.email })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { email: ['exists'] },
    })
  })
})
