const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const {
  selectOneBy: selectOwnerBy,
  updateById: updateOwnerById,
} = require('../../../../../models/v1/owners/repositories')
const {
  selectWithPropertiesBy: selectUnitsBy,
  updateBy: updateUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/owners/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/database')
jest.mock('../../../../../models/v1/owners/repositories')
jest.mock('../../../../../models/v1/units/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/owners/:id', () => {
  const id = 'id'
  const accountId = 'accountId'
  const email = 'email'
  const phoneNumber = 'phoneNumber'
  const body = 'body'

  const payload = {
    email, phoneNumber,
  }

  const req = {
    body, user: { accountId }, params: { id },
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const trx = 'trx'
    const statusCode = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    const where = jest.fn().mockResolvedValue([
      { id: 2 }, { id: 5 }, { id: 10 },
    ])
    const whereInFirst = jest.fn().mockResolvedValue()
    const whereInSecond = jest.fn().mockResolvedValue()

    validate.mockResolvedValue({ name: 'name', units: [1, 2, 5] })
    selectOwnerBy.mockResolvedValue('data')
    selectUnitsBy.mockReturnValue({ where })
    createTransaction.mockImplementation((fn) => fn(trx))
    updateOwnerById.mockResolvedValue()

    updateUnitsBy.mockReturnValueOnce({ whereIn: whereInFirst })
    updateUnitsBy.mockReturnValueOnce({ whereIn: whereInSecond })

    await expect(httpHandler(req, { sendStatus })).resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOwnerBy).toBeCalledWith({ accountId, id })
    expect(selectUnitsBy).toBeCalledWith({ accountId })
    expect(where).toBeCalledWith(expect.any(Function))
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateOwnerById).toBeCalledWith(id, { name: 'name' }, trx)
    expect(updateUnitsBy).toHaveBeenNthCalledWith(1, {}, { ownerId: null }, trx)
    expect(updateUnitsBy).toHaveBeenNthCalledWith(2, {}, { ownerId: id }, trx)
    expect(whereInFirst).toBeCalledWith('id', [2, 5, 10])
    expect(whereInSecond).toBeCalledWith('id', [2, 5])
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should update a resource without units', async () => {
    const trx = 'trx'
    const statusCode = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue({ name: 'name', units: [] })
    selectOwnerBy.mockResolvedValue('data')
    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler(req, { sendStatus })).resolves.toEqual(statusCode)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOwnerBy).toBeCalledWith({ accountId, id })
    expect(selectUnitsBy).not.toBeCalled()
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateOwnerById).toBeCalledWith(id, { name: 'name' }, trx)
    expect(updateUnitsBy).not.toBeCalled()
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if owner does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ permissions: null })
    selectOwnerBy.mockResolvedValue(null)

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOwnerBy).toBeCalledWith({ id, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when user email already exists', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockResolvedValue('data')

    validate.mockResolvedValue({ email })
    selectOwnerBy.mockResolvedValueOnce('data')
    selectOwnerBy.mockReturnValueOnce({ where })

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOwnerBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectOwnerBy).toHaveBeenNthCalledWith(2, { accountId, email })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(updateOwnerById).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: {
        email: ['exists'],
      },
    })
  })

  it('should throw an error when user phone number already exists', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const whereFirst = jest.fn().mockResolvedValue()
    const whereSecond = jest.fn().mockResolvedValue('data')

    validate.mockResolvedValue(payload)
    selectOwnerBy.mockResolvedValueOnce('data')
    selectOwnerBy.mockReturnValueOnce({ where: whereFirst })
    selectOwnerBy.mockReturnValueOnce({ where: whereSecond })

    await expect(httpHandler(req)).rejects
      .toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOwnerBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectOwnerBy).toHaveBeenNthCalledWith(2, { accountId, email })
    expect(selectOwnerBy).toHaveBeenNthCalledWith(3, { accountId, phoneNumber })
    expect(whereFirst).toBeCalledWith('id', '!=', id)
    expect(whereSecond).toBeCalledWith('id', '!=', id)
    expect(updateOwnerById).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: {
        phoneNumber: ['exists'],
      },
    })
  })
})
