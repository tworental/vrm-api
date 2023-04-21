const cache = require('../../../../../services/cacheManager')
const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { createTransaction } = require('../../../../../services/database')
const { upsertGroup, deleteProperty } = require('../../../../../services/channex')
const { validate } = require('../../../../../services/validate')
const {
  updateBy: updateAccountBy,
} = require('../../../../../models/v1/accounts/repositories')
const {
  updateBy: updatePropertiesBy,
} = require('../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectChannelManagerBy,
} = require('../../../../../models/v1/channel-managers/repositories')
const {
  selectBy: selectPropertyChannelManagersBy,
  deleteBy: deletePropertyChannelManagersBy,
} = require('../../../../../models/v1/property-channel-managers/repositories')
const {
  selectOneBy: selectChannelManagerAccountBy,
  updateBy: updateChannelManagerAccountBy,
  create: createChannelManagerAccount,
} = require('../../../../../models/v1/channel-manager-accounts/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/channel-manager-accounts/schema')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/database')
jest.mock('../../../../../services/channex')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/accounts/repositories')
jest.mock('../../../../../models/v1/properties/repositories')
jest.mock('../../../../../models/v1/channel-managers/repositories')
jest.mock('../../../../../models/v1/property-channel-managers/repositories')
jest.mock('../../../../../models/v1/channel-manager-accounts/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/channel-managers/:id', () => {
  const accountId = 'accountId'
  const channelManagerId = 'id'
  const account = { id: accountId }
  const trx = 'trx'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should enable channel manager', async () => {
    const results = 200
    const body = { enabled: 1 }

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectChannelManagerBy.mockResolvedValue({ id: channelManagerId })
    validate.mockResolvedValue(body)
    selectChannelManagerAccountBy.mockResolvedValue(null)
    createChannelManagerAccount.mockResolvedValue({
      id: 1,
    })
    createTransaction.mockImplementation((fn) => fn(trx))
    upsertGroup.mockResolvedValue({ data: { id: 'channexId' } })

    await expect(httpHandler({ body, account, params: { id: channelManagerId } }, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectChannelManagerBy).toBeCalledWith({ id: channelManagerId, enabled: 1 })
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectChannelManagerAccountBy).toBeCalledWith({
      accountId, channelManagerId,
    })
    expect(createChannelManagerAccount).toBeCalledWith({
      accountId, channelManagerId,
    })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateChannelManagerAccountBy).toBeCalledWith({ id: 1 }, { enabled: 1 }, trx)
    expect(upsertGroup).toBeCalledWith(account)
    expect(updateAccountBy).toBeCalledWith({ id: account.id }, { channexId: 'channexId' }, trx)
    expect(cache.del).toBeCalledWith(`accounts.${account.identifier}.*`)
    expect(sendStatus).toBeCalledWith(results)
  })

  it('should disable channel manager', async () => {
    const results = 200
    const body = { enabled: 0 }

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectChannelManagerBy.mockResolvedValue({ id: channelManagerId })
    validate.mockResolvedValue(body)
    selectChannelManagerAccountBy.mockResolvedValue({ id: 1 })
    createTransaction.mockImplementation((fn) => fn(trx))

    const whereNotNull = jest.fn().mockResolvedValue([{ propertyId: 1, channexId: 'property-channex' }])
    const where = jest.fn().mockReturnValue({ whereNotNull })
    const join = jest.fn().mockReturnValue({ where })
    const select = jest.fn().mockReturnValue({ join })
    selectPropertyChannelManagersBy.mockReturnValue({ select })

    const updatePropertiesByWhereIn = jest.fn()
    updatePropertiesBy.mockReturnValue({ whereIn: updatePropertiesByWhereIn })

    await expect(httpHandler({ body, account, params: { id: channelManagerId } }, { sendStatus }))
      .resolves.toEqual(results)

    expect(selectChannelManagerBy).toBeCalledWith({ id: channelManagerId, enabled: 1 })
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectChannelManagerAccountBy).toBeCalledWith({
      accountId, channelManagerId,
    })
    expect(createChannelManagerAccount).not.toBeCalled()
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateChannelManagerAccountBy).toBeCalledWith({ id: 1 }, { enabled: 0 }, trx)

    expect(selectPropertyChannelManagersBy).toBeCalled()
    expect(select).toBeCalledWith('channex_id')
    expect(join).toBeCalledWith('properties', 'properties.id', 'property_channel_managers.property_id')
    expect(where).toBeCalledWith('properties.account_id', '=', accountId)
    expect(whereNotNull).toBeCalledWith('channex_id')

    expect(deleteProperty).toBeCalledWith('property-channex')

    expect(updateAccountBy).toBeCalledWith({ id: accountId }, { channexId: null }, trx)
    expect(updatePropertiesBy).toBeCalledWith({ accountId }, { channexId: null }, trx)
    expect(updatePropertiesByWhereIn).toBeCalledWith('id', [1])
    expect(deletePropertyChannelManagersBy).toBeCalledWith({ accountId }, trx)

    expect(cache.del).toBeCalledWith(`accounts.${account.identifier}.*`)
    expect(sendStatus).toBeCalledWith(results)
  })

  it('should throw if channel manager does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(httpHandler({ account, params: { id: channelManagerId } }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
    expect(selectChannelManagerBy).toBeCalledWith({ id: channelManagerId, enabled: 1 })
  })
})
