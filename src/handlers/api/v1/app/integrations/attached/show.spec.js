const { handler } = require('../../../../../../services/http')
const {
  selectOneBy: selectIntegrationBy,
} = require('../../../../../../models/v1/integrations/repositories')
const {
  selectOneBy: selectIntegrationAccountBy,
} = require('../../../../../../models/v1/integration-accounts/repositories')

jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/integrations/repositories')
jest.mock('../../../../../../models/v1/integration-accounts/repositories')

const httpHandler = require('./show')

describe('GET /v1/app/integrations/:integrationId/attached', () => {
  it('should display resource', async () => {
    const accountId = 'accountId'
    const integrationId = 1

    const data = {
      enabled: 0,
    }

    selectIntegrationBy.mockResolvedValue('integration')
    selectIntegrationAccountBy.mockResolvedValue(data)

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user: { accountId }, params: { integrationId } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectIntegrationBy).toBeCalledWith({ id: integrationId, enabled: 1 })
    expect(selectIntegrationAccountBy).toBeCalledWith({ accountId, integrationId })
    expect(json).toBeCalledWith({ data })
  })

  it('should return null if integration does not exist', async () => {
    const accountId = 'anotherId'
    const integrationId = 2

    selectIntegrationBy.mockResolvedValue(null)

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user: { accountId }, params: { integrationId } }, { json }))
      .resolves.toEqual({ data: null })

    expect(handler).toBeCalled()
    expect(selectIntegrationBy).toBeCalledWith({ id: integrationId, enabled: 1 })
    expect(selectIntegrationAccountBy).not.toBeCalledWith({ accountId, integrationId })
    expect(json).toBeCalledWith({ data: null })
  })
})
