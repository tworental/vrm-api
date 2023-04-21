const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const {
  updateBy: updateServiceBy,
  selectOneBy: selectServiceBy,
} = require('../../../../../models/v1/services/repositories')
const {
  selectOneBy: selectServiceProviderBy,
} = require('../../../../../models/v1/service-providers/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/services/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/services/repositories')
jest.mock('../../../../../models/v1/service-providers/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/services/:id', () => {
  const accountId = 'accountId'
  const id = 'id'
  const body = 'body'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const statusCode = 200
    const payload = {
      name: 'name',
      serviceProviderId: 'serviceProviderId',
    }

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockResolvedValue()

    selectServiceBy.mockResolvedValueOnce('service')
    selectServiceBy.mockReturnValueOnce({ where })
    validate.mockResolvedValue(payload)
    selectServiceProviderBy.mockResolvedValue('serviceProvider')

    await expect(httpHandler({ user: { accountId }, params: { id }, body }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectServiceBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectServiceBy).toHaveBeenNthCalledWith(2, { accountId, name: payload.name })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(selectServiceProviderBy).toBeCalledWith({ id: payload.serviceProviderId, accountId })
    expect(updateServiceBy).toBeCalledWith({ id }, payload)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error when resource with the same name already exist', async () => {
    const errorMessage = 'Validation Failed'

    const payload = {
      name: 'name',
      serviceProviderId: 'serviceProviderId',
    }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockResolvedValue('differentService')

    selectServiceBy.mockResolvedValueOnce('service')
    selectServiceBy.mockReturnValueOnce({ where })
    validate.mockResolvedValue(payload)
    selectServiceProviderBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id }, body }))
      .rejects.toThrow(errorMessage)

    expect(selectServiceBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectServiceBy).toHaveBeenNthCalledWith(2, { accountId, name: payload.name })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectServiceProviderBy).not.toBeCalled()
    expect(updateServiceBy).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { name: ['unique'] },
    })
  })

  it('should throw an error when service provider does not exists', async () => {
    const errorMessage = 'Validation Failed'

    const payload = {
      serviceProviderId: 'serviceProviderId',
    }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectServiceBy.mockResolvedValueOnce('service')
    validate.mockResolvedValue(payload)
    selectServiceProviderBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id }, body }))
      .rejects.toThrow(errorMessage)

    expect(selectServiceBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectServiceProviderBy).toBeCalledWith({ id: payload.serviceProviderId, accountId })
    expect(updateServiceBy).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { serviceProviderId: ['notExists'] },
    })
  })

  it('should throw an error when resource does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectServiceBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id }, body }))
      .rejects.toThrow(errorMessage)

    expect(selectServiceBy).toBeCalledWith({ accountId, id })
    expect(validate).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
