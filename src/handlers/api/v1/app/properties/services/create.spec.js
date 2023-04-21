const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const {
  selectOneBy: selectProperty,
} = require('../../../../../../models/v1/properties/repositories')
const {
  create: createPropertyService,
  selectOneBy: selectPropertyService,
} = require('../../../../../../models/v1/property-services/repositories')
const { selectOneBy: selectService } = require('../../../../../../models/v1/services/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-services/repositories')
jest.mock('../../../../../../models/v1/services/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/properties/:propertyId/services', () => {
  const accountId = 100
  const propertyId = 1
  const body = { serviceId: 10 }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const statusCode = 200

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectProperty.mockResolvedValue({ id: propertyId })
    selectService.mockResolvedValue({ id: body.serviceId })
    selectPropertyService.mockResolvedValue(null)

    await expect(httpHandler({ account: { id: accountId }, params: { propertyId }, body }, { sendStatus }))
      .resolves.toBe(statusCode)

    expect(handler).toBeCalled()
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectService).toBeCalledWith({ id: body.serviceId, accountId })
    expect(selectPropertyService).toBeCalledWith({ propertyId, serviceId: body.serviceId })
    expect(createPropertyService).toBeCalledWith({ propertyId, serviceId: body.serviceId })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({ account: { id: accountId }, params: { propertyId }, body }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(createPropertyService).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if service does not exists', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue({ id: propertyId })
    selectService.mockResolvedValue(null)

    await expect(httpHandler({ account: { id: accountId }, params: { propertyId }, body }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectService).toBeCalledWith({ id: body.serviceId, accountId })
    expect(selectPropertyService).not.toBeCalled()
    expect(createPropertyService).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { serviceId: ['notExists'] },
    })
  })

  it('should not create a resource if property service exists', async () => {
    const statusCode = 200

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectProperty.mockResolvedValue({ id: propertyId })
    selectService.mockResolvedValue({ id: body.serviceId })
    selectPropertyService.mockResolvedValue({ propertyId, serviceId: body.serviceId })

    await expect(httpHandler({ account: { id: accountId }, params: { propertyId }, body }, { sendStatus }))
      .resolves.toBe(statusCode)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectService).toBeCalledWith({ id: body.serviceId, accountId })
    expect(selectPropertyService).toBeCalledWith({ propertyId, serviceId: body.serviceId })
    expect(createPropertyService).not.toBeCalled()
    expect(sendStatus).toBeCalledWith(statusCode)
  })
})
