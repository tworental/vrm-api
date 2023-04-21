const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const { updateBy: updateAccountBy } = require('../../../../../models/v1/accounts/repositories')
const { updateBy: updateAccountSettingsBy } = require('../../../../../models/v1/account-settings/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/accounts/schema')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/database')
jest.mock('../../../../../models/v1/accounts/repositories')
jest.mock('../../../../../models/v1/account-settings/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/account', () => {
  it('should update a resource', async () => {
    const response = 204
    const identifier = 'identifier'
    const id = 1
    const body = 'body'
    const auth = { jti: 'jti' }
    const payload = {
      domain: 'domain',
      companyName: 'companyName',
      companyAddress: 'companyAddress',
      companyZip: 'companyZip',
      companyCity: 'companyCity',
      companyCountry: 'companyCountry',
      companyVatId: 'companyVatId',
      locale: 'locale',
    }
    const trx = 'trx'

    const sendStatus = jest.fn().mockImplementation((args) => args)
    createTransaction.mockImplementation((fn) => fn(trx))

    validate.mockResolvedValue(payload)
    updateAccountBy.mockResolvedValue()
    updateAccountSettingsBy.mockResolvedValue()

    await expect(httpHandler({ auth, account: { id, identifier }, body }, { sendStatus }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateAccountBy).toBeCalledWith({ id }, {
      domain: 'domain',
      companyName: 'companyName',
      companyAddress: 'companyAddress',
      companyZip: 'companyZip',
      companyCity: 'companyCity',
      companyCountry: 'companyCountry',
      companyVatId: 'companyVatId',
    }, trx)
    expect(updateAccountSettingsBy).toBeCalledWith({ accountId: id }, { locale: 'locale' }, trx)
    expect(cache.del).toBeCalledWith([
      'accounts.identifier.jti',
      'accounts.1.settings',
    ])
    expect(sendStatus).toBeCalledWith(response)
  })
})
