const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectProperty,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectPropertyImage,
  updateBy: updatePropertyImages,
} = require('../../../../../../models/v1/property-images/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/property-images/schema')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-images/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/properties/images', () => {
  const body = 'body'
  const accountId = 'accountId'
  const id = 'id'
  const propertyId = 'propertyId'
  const payload = { key: 'value', main: 1 }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update an resource', async () => {
    const status = 204
    const trx = 'trx'

    const sendStatus = jest.fn().mockImplementation((args) => args)

    createTransaction.mockImplementation((fn) => fn(trx))

    validate.mockResolvedValue(payload)
    selectProperty.mockResolvedValue('property')
    selectPropertyImage.mockResolvedValue('propertyImage')
    updatePropertyImages.mockResolvedValue()

    await expect(httpHandler({ body, user: { accountId }, params: { id, propertyId } }, { sendStatus }))
      .resolves.toBe(status)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyImage).toBeCalledWith({ id, propertyId })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updatePropertyImages).toHaveBeenNthCalledWith(1, { propertyId }, { main: 0 }, trx)
    expect(updatePropertyImages).toHaveBeenNthCalledWith(2, { id, propertyId }, payload, trx)
    expect(sendStatus).toBeCalledWith(status)
  })

  it('should throw an error when property does not exist', async () => {
    const errorMessage = 'Not Found'
    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({ body, user: { accountId }, params: { id, propertyId } }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })

  it('should throw an error when property image does not exist', async () => {
    const errorMessage = 'Not Found'
    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectProperty.mockResolvedValue('property')
    selectPropertyImage(null)

    await expect(httpHandler({ body, user: { accountId }, params: { id, propertyId } }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyImage).toBeCalledWith({ id, propertyId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })
})
