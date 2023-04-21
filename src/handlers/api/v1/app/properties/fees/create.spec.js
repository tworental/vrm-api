const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const {
  create: createPropertyFee,
  selectOneBy: selectPropertyFee,
} = require('../../../../../../models/v1/property-fees/repositories')
const { selectOneBy: selectFee } = require('../../../../../../models/v1/fees/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-fees/repositories')
jest.mock('../../../../../../models/v1/fees/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/properties/:propertyId/fees', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  const accountId = 'accountId'
  const propertyId = 'propertyId'
  const feeId = 'feeId'

  it('should create a resource', async () => {
    const response = 201
    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectProperty.mockResolvedValue('property')
    selectFee.mockResolvedValue('fee')
    selectPropertyFee.mockResolvedValue('propertyFee')
    createPropertyFee.mockResolvedValue()

    await expect(httpHandler({ body: { feeId }, params: { propertyId }, account: { id: accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectFee).toBeCalledWith({ id: feeId, accountId })
    expect(selectPropertyFee).toBeCalledWith({ propertyId, feeId })
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({ body: { feeId }, params: { propertyId }, account: { id: accountId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectFee).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue('property')
    selectFee.mockResolvedValue(null)

    await expect(httpHandler({ body: { feeId }, params: { propertyId }, account: { id: accountId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectFee).toBeCalledWith({ id: feeId, accountId })
    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { feeId: ['notExists'] },
    })
  })
})
