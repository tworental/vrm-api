const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const { selectBy: selectPropertyTaxes } = require('../../../../../../models/v1/property-taxes/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/property-taxes/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-taxes/repositories')
jest.mock('../../../../../../models/v1/property-taxes/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/properties/:propertyId/taxes', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  const accountId = 'accountId'
  const propertyId = 'propertyId'

  it('should display all resources', async () => {
    const data = ['tax']
    const propertyTaxes = { data }

    const json = jest.fn().mockImplementation((args) => args)

    const join = jest.fn().mockResolvedValue(propertyTaxes)
    const select = jest.fn().mockReturnValue({ join })

    selectProperty.mockResolvedValue('property')
    selectPropertyTaxes.mockReturnValue({ select })
    serialize.mockReturnValue(propertyTaxes.data)

    await expect(httpHandler({ params: { propertyId }, account: { id: accountId } }, { json }))
      .resolves.toEqual(propertyTaxes)

    expect(handler).toBeCalled()
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyTaxes).toBeCalledWith({ propertyId })
    expect(select).toBeCalledWith(['taxes.*', 'property_taxes.id'])
    expect(join).toBeCalledWith('taxes', 'taxes.id', 'property_taxes.tax_id')
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, propertyTaxes)
    expect(json).toBeCalledWith(propertyTaxes)
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
    expect(selectPropertyTaxes).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
