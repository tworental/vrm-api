const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const {
  create: createPropertyTax,
  selectOneBy: selectPropertyTax,
} = require('../../../../../../models/v1/property-taxes/repositories')
const { selectOneBy: selectTax } = require('../../../../../../models/v1/taxes/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-taxes/repositories')
jest.mock('../../../../../../models/v1/taxes/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/properties/:propertyId/taxes', () => {
  const accountId = 'accountId'
  const propertyId = 'propertyId'
  const taxId = 'taxId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const response = 201
    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectProperty.mockResolvedValue('property')
    selectTax.mockResolvedValue('tax')
    selectPropertyTax.mockResolvedValue('propertyTax')
    createPropertyTax.mockResolvedValue()

    await expect(httpHandler({ body: { taxId }, params: { propertyId }, account: { id: accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectTax).toBeCalledWith({ id: taxId, accountId })
    expect(selectPropertyTax).toBeCalledWith({ propertyId, taxId })
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({ body: { taxId }, params: { propertyId }, account: { id: accountId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectTax).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue('property')
    selectTax.mockResolvedValue(null)

    await expect(httpHandler({ body: { taxId }, params: { propertyId }, account: { id: accountId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectTax).toBeCalledWith({ id: taxId, accountId })
    expect(selectPropertyTax).not.toBeCalled()
    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { taxId: ['notExists'] },
    })
  })
})
