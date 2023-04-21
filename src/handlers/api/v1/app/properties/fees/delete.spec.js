const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectPropertyFee,
  deleteBy: deletePropertyFee,
} = require('../../../../../../models/v1/property-fees/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/errorCodes')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-fees/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/properties/:propertyId/fee/:id', () => {
  const accountId = 1
  const propertyId = 100
  const id = 1000

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const response = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectProperty.mockResolvedValue(true)
    selectPropertyFee.mockResolvedValue(true)
    deletePropertyFee.mockResolvedValue()

    await expect(httpHandler({ params: { propertyId, id }, account: { id: accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyFee).toBeCalledWith({ id, propertyId })
    expect(deletePropertyFee).toBeCalledWith({ id, propertyId })
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should throw an error when a property is not found', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({ params: { propertyId, id }, account: { id: accountId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyFee).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when a property is not found', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue('property')
    selectPropertyFee.mockResolvedValue(null)

    await expect(httpHandler({ params: { propertyId, id }, account: { id: accountId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyFee).toBeCalledWith({ id, propertyId })
    expect(deletePropertyFee).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
