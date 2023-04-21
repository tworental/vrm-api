const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { publish } = require('../../../../../../services/pubsub')
const {
  selectOneBy: selectIntegrationBy,
} = require('../../../../../../models/v1/integrations/repositories')
const {
  create: createIntegrationAccount,
  updateBy: updateIntegrationAccountBy,
  selectOneBy: selectIntegrationAccountBy,
} = require('../../../../../../models/v1/integration-accounts/repositories')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/integration-accounts/schema')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/errorCodes')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/pubsub')
jest.mock('../../../../../../models/v1/integrations/repositories')
jest.mock('../../../../../../models/v1/integration-accounts/repositories')
jest.mock('../../../../../../models/v1/integration-accounts/schema')

const httpHandler = require('./upsert')

describe('POST /v1/app/integrations/:integrationId/attached', () => {
  const body = {
    settings: {},
  }

  it('should create resource', async () => {
    const statusCode = 202
    const accountId = 'accountId'
    const integrationId = 1

    selectIntegrationBy.mockResolvedValue('integration')
    const select = jest.fn().mockResolvedValue(null)
    const clearSelect = jest.fn().mockReturnValue({ select })
    const join = jest.fn().mockReturnValue({ clearSelect })

    selectIntegrationAccountBy.mockReturnValue({ join })
    validate.mockResolvedValue(body)

    const sendStatus = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user: { accountId }, params: { integrationId }, body }, { sendStatus }))
      .resolves.toBe(statusCode)

    expect(handler).toBeCalled()
    expect(selectIntegrationBy).toBeCalledWith({ id: integrationId, enabled: 1 })
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectIntegrationAccountBy).toBeCalledWith({ accountId, integrationId })
    expect(createIntegrationAccount).toBeCalledWith({ ...body, accountId, integrationId })
    expect(cache.del).toBeCalledWith('accounts.accountId.integrations')
    expect(sendStatus).toBeCalledWith(statusCode)
    expect(join).toBeCalledWith('integrations', 'integrations.id', 'integration_accounts.integration_id')
    expect(clearSelect).toBeCalled()
    expect(select).toBeCalledWith(['integration_accounts.*', 'integrations.name'])
  })

  it('should update resource', async () => {
    const statusCode = 202
    const accountId = 'accountId'
    const integrationId = 1
    const name = 'name'

    selectIntegrationBy.mockResolvedValue('integration')

    const select = jest.fn().mockResolvedValue({ name })
    const clearSelect = jest.fn().mockReturnValue({ select })
    const join = jest.fn().mockReturnValue({ clearSelect })

    selectIntegrationAccountBy.mockReturnValue({ join })
    validate.mockResolvedValue(body)

    const sendStatus = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user: { accountId }, params: { integrationId }, body }, { sendStatus }))
      .resolves.toBe(statusCode)

    expect(handler).toBeCalled()
    expect(selectIntegrationBy).toBeCalledWith({ id: integrationId, enabled: 1 })
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectIntegrationAccountBy).toBeCalledWith({ accountId, integrationId })
    expect(updateIntegrationAccountBy).toBeCalledWith({ accountId, integrationId }, { ...body })
    expect(cache.del).toBeCalledWith('accounts.accountId.integrations')
    expect(sendStatus).toBeCalledWith(statusCode)
    expect(join).toBeCalledWith('integrations', 'integrations.id', 'integration_accounts.integration_id')
    expect(clearSelect).toBeCalled()
    expect(select).toBeCalledWith(['integration_accounts.*', 'integrations.name'])
    expect(publish).toBeCalledWith('update:integration', {
      accountId,
      name,
      old: { name },
      current: body,
    })
  })

  it('should throw an error if integration does not exist', async () => {
    const errorMessage = 'Not Found'
    const accountId = 'accountId'
    const integrationId = 1

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectIntegrationBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { integrationId }, body }))
      .rejects.toThrow(errorMessage)

    expect(selectIntegrationBy).toBeCalledWith({ id: integrationId, enabled: 1 })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })
})
