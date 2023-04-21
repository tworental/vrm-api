const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const { selectOneBy: selectCustomerContactBy } = require('../../../../../../models/v1/customer-contacts/repositories')
const {
  create: createPropertyCustomerContact,
  selectOneBy: selectPropertyCustomerContactBy,
} = require('../../../../../../models/v1/property-customer-contacts/repositories')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/customer-contacts/repositories')
jest.mock('../../../../../../models/v1/property-customer-contacts/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/properties/:propertyId/customer-contacts', () => {
  const accountId = 1
  const propertyId = 100

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const response = 201
    const customerContactId = 1

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectPropertyBy.mockResolvedValue(true)
    selectCustomerContactBy.mockResolvedValue(true)
    selectPropertyCustomerContactBy.mockResolvedValue(false)

    await expect(httpHandler({
      params: { propertyId }, user: { accountId }, body: { customerContactId },
    }, { sendStatus }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(cache.del).toBeCalledWith(`accounts.${accountId}.properties.*`)
    expect(sendStatus).toBeCalledWith(response)
    expect(selectPropertyBy).toBeCalledWith({ accountId, id: propertyId })
    expect(selectCustomerContactBy).toBeCalledWith({ accountId, id: customerContactId })
    expect(selectPropertyCustomerContactBy).toBeCalledWith({ accountId, propertyId, customerContactId })
    expect(createPropertyCustomerContact).toBeCalledWith({ accountId, propertyId, customerContactId })
  })

  it('should not create a resource if the one exists', async () => {
    const response = 201
    const customerContactId = 1

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectPropertyBy.mockResolvedValue(true)
    selectCustomerContactBy.mockResolvedValue(true)
    selectPropertyCustomerContactBy.mockResolvedValue(true)

    await expect(httpHandler({
      params: { propertyId }, user: { accountId }, body: { customerContactId },
    }, { sendStatus }))
      .resolves.toEqual(response)

    expect(cache.del).toBeCalledWith(`accounts.${accountId}.properties.*`)
    expect(sendStatus).toBeCalledWith(response)
    expect(selectPropertyBy).toBeCalledWith({ accountId, id: propertyId })
    expect(selectCustomerContactBy).toBeCalledWith({ accountId, id: customerContactId })
    expect(selectPropertyCustomerContactBy).toBeCalledWith({ accountId, propertyId, customerContactId })
    expect(createPropertyCustomerContact).not.toBeCalledWith({ accountId, propertyId, customerContactId })
  })

  it('should throw an error when a property is not found', async () => {
    const errorMessage = 'Validation Failed'
    const customerContactId = 1

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ params: { propertyId }, user: { accountId }, body: { customerContactId } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ accountId, id: propertyId })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { propertyId: ['notExists'] },
    })
  })

  it('should throw an error when a customer contact is not found', async () => {
    const errorMessage = 'Validation Failed'
    const customerContactId = 1

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(true)
    selectCustomerContactBy.mockResolvedValue(false)

    await expect(httpHandler({ params: { propertyId }, user: { accountId }, body: { customerContactId } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ accountId, id: propertyId })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { customerContactId: ['notExists'] },
    })
  })
})
