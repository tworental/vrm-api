const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const { selectBy: selectPropertyFees } = require('../../../../../../models/v1/property-fees/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/property-fees/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-fees/repositories')
jest.mock('../../../../../../models/v1/property-fees/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/properties/:propertyId/fees', () => {
  const accountId = 'accountId'
  const propertyId = 'propertyId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const data = ['fee']
    const propertyFees = { data }

    const json = jest.fn().mockImplementation((args) => args)

    const join = jest.fn().mockResolvedValue(propertyFees)
    const select = jest.fn().mockReturnValue({ join })

    selectProperty.mockResolvedValue('property')
    selectPropertyFees.mockReturnValue({ select })
    serialize.mockReturnValue(propertyFees.data)

    await expect(httpHandler({ params: { propertyId }, account: { id: accountId } }, { json }))
      .resolves.toEqual(propertyFees)

    expect(handler).toBeCalled()
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyFees).toBeCalledWith({ propertyId })
    expect(select).toBeCalledWith(['fees.*', 'property_fees.id'])
    expect(join).toBeCalledWith('fees', 'fees.id', 'property_fees.fee_id')
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, propertyFees)
    expect(json).toBeCalledWith(propertyFees)
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({ params: { propertyId }, account: { id: accountId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyFees).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
