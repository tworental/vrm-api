const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../../models/v1/property-customer-contacts/repositories')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/property-customer-contacts/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/properties/:propertyId/customer-contacts/:id', () => {
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

    selectOneBy.mockResolvedValue(true)
    deleteBy.mockResolvedValue()

    await expect(httpHandler({ params: { propertyId, id }, user: { accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ id, propertyId, accountId })
    expect(deleteBy).toBeCalledWith({ id, propertyId, accountId })
    expect(cache.del).toBeCalledWith(`accounts.${accountId}.properties.*`)
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should throw an error when a resource is not found', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ params: { propertyId, id }, user: { accountId } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId, propertyId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
