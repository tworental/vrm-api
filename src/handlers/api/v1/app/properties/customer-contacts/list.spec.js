const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const {
  selectBy: selectPropertyCustomerContactsBy,
  withCustomerContacts,
} = require('../../../../../../models/v1/property-customer-contacts/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-customer-contacts/repositories')

const httpHandler = require('./list')

describe('GET /v1/app/properties/:propertyId/customer-contacts', () => {
  const accountId = 'accountId'
  const propertyId = 'propertyId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const data = ['contact']
    const contacts = { data }
    const customerSelectResponse = 'response'

    const json = jest.fn().mockImplementation((args) => args)

    const where = jest.fn().mockReturnValue(customerSelectResponse)
    selectPropertyCustomerContactsBy.mockReturnValue({ where })
    withCustomerContacts.mockResolvedValue(data)

    selectPropertyBy.mockResolvedValue('property')

    await expect(httpHandler({ params: { propertyId }, user: { accountId } }, { json }))
      .resolves.toEqual(contacts)

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyCustomerContactsBy).toBeCalledWith({ propertyId })
    expect(where).toBeCalledWith('customer_contacts.account_id', '=', accountId)
    expect(json).toBeCalledWith(contacts)
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ params: { propertyId }, user: { accountId } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
