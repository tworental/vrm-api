const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { raw } = require('../../../../../../services/database')
const { getHealthProperties } = require('../../../../../../services/channex')
const { camelcaseKeys } = require('../../../../../../services/utility')
const {
  selectBy: selectChannelManagersBy,
  withAccount,
} = require('../../../../../../models/v1/channel-managers/repositories')
const {
  selectBy: selectPropertyChannelManagers,
} = require('../../../../../../models/v1/property-channel-managers/repositories')
const {
  selectOneBy: selectProperty,
  isPropertyCompleted,
} = require('../../../../../../models/v1/properties/repositories')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../services/channex')
jest.mock('../../../../../../services/utility')
jest.mock('../../../../../../models/v1/channel-managers/repositories')
jest.mock('../../../../../../models/v1/property-channel-managers/repositories')
jest.mock('../../../../../../models/v1/properties/repositories')

const httpHandler = require('./list')

describe('GET /v1/app/properties/:propertyId/channels', () => {
  const propertyId = 1
  const accountId = 100
  const channexId = 'channexId'

  const property = { channexId }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all channels list', async () => {
    const channelManagers = [
      {
        id: 1,
        channelManagerAccountId: 1,
        name: 'channex',
        enabled: 1,
        propertyChannelEnabled: 1,
      },
      {
        id: 2,
        channelManagerAccountId: 1,
        name: 'channex',
        enabled: 1,
        propertyChannelEnabled: 0,
      },
      {
        id: 3,
        channelManagerAccountId: 1,
        name: 'channex',
        enabled: 1,
        propertyChannelEnabled: 1,
      },
    ]
    const data = [
      {
        id: 1,
        channelManagerAccountId: 1,
        name: 'channex',
        enabled: 1,
        active: 1,
        health: 'attributes',
      },
      {
        id: 2,
        channelManagerAccountId: 1,
        name: 'channex',
        enabled: 0,
        active: 1,
        health: undefined,
      },
      {
        id: 3,
        channelManagerAccountId: 1,
        name: 'channex',
        enabled: 1,
        active: 1,
        health: undefined,
      },
    ]
    const results = { data }

    const json = jest.fn().mockImplementation((args) => args)

    selectProperty.mockResolvedValue(property)
    isPropertyCompleted.mockResolvedValue(true)

    raw.mockReturnValueOnce('property_channel_managers.enabled AS propertyChannelEnabled')
    raw.mockReturnValueOnce('channel_manager_accounts.id AS channelManagerAccountId')

    const select = jest.fn().mockResolvedValue(channelManagers)

    const as = jest.fn().mockReturnValue('property_channel_managers')
    const where = jest.fn().mockReturnValue({ as })
    selectPropertyChannelManagers.mockReturnValue({ where })

    const leftJoin = jest.fn().mockReturnValue({ select })

    withAccount.mockImplementation(() => (queryBuilder) => queryBuilder)
    camelcaseKeys.mockImplementation((args) => args)

    selectChannelManagersBy.mockReturnValue({ leftJoin })

    getHealthProperties.mockResolvedValueOnce({ data: { attributes: 'attributes' } })
    getHealthProperties.mockRejectedValueOnce(null)

    await expect(httpHandler({ account: { id: accountId }, params: { propertyId } }, { json }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(isPropertyCompleted).toBeCalledWith(property)
    expect(raw).toBeCalledWith('property_channel_managers.enabled AS propertyChannelEnabled')
    expect(raw).toBeCalledWith('channel_manager_accounts.id AS channelManagerAccountId')
    expect(select).toBeCalledWith([
      'property_channel_managers.enabled AS propertyChannelEnabled',
      'channel_manager_accounts.id AS channelManagerAccountId',
    ])

    expect(selectPropertyChannelManagers).toBeCalled()
    expect(where).toBeCalledWith('property_id', '=', propertyId)
    expect(as).toBeCalledWith('property_channel_managers')

    expect(leftJoin).toBeCalledWith(
      'property_channel_managers',
      'property_channel_managers.channel_manager_account_id',
      'channel_manager_accounts.id',
    )

    expect(withAccount).toBeCalledWith(accountId)
    expect(selectChannelManagersBy).toBeCalled()

    expect(getHealthProperties).toBeCalledTimes(2)
    expect(getHealthProperties).toBeCalledWith(channexId)
    expect(camelcaseKeys).toBeCalledWith('attributes')
    expect(cache.del).toBeCalledWith(`accounts.${accountId}.properties.${propertyId}`)

    expect(json).toBeCalledWith(results)
  })

  it('should throw an error if property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({ account: { id: accountId }, params: { propertyId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if property is not completed', async () => {
    const errorMessage = 'Not Completed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(property)
    isPropertyCompleted.mockResolvedValue(false)

    await expect(httpHandler({ account: { id: accountId }, params: { propertyId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(isPropertyCompleted).toBeCalledWith(property)
    expect(createError).toBeCalledWith(422, errorMessage, { code: 'NOT_COMPLETED' })
  })
})
