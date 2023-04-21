const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const {
  selectOneBy: selectProperty,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectPropertyService,
  deleteBy: deletePropertyService,
} = require('../../../../../../models/v1/property-services/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-services/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/properties/:propertyId/services/:id', () => {
  const id = 1
  const accountId = 100
  const propertyId = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const statusCode = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectProperty.mockResolvedValue({ id: propertyId })
    selectPropertyService.mockResolvedValue({ id, propertyId })

    await expect(httpHandler({ account: { id: accountId }, params: { id, propertyId } }, { sendStatus }))
      .resolves.toBe(statusCode)

    expect(handler).toBeCalled()
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyService).toBeCalledWith({ id, propertyId })
    expect(deletePropertyService).toBeCalledWith({ id, propertyId })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({ account: { id: accountId }, params: { id, propertyId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(deletePropertyService).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if property service does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue({ id: propertyId })
    selectPropertyService.mockResolvedValue(null)

    await expect(httpHandler({ account: { id: accountId }, params: { id, propertyId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyService).toBeCalledWith({ id, propertyId })
    expect(deletePropertyService).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
