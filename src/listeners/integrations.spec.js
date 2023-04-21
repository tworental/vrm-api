const { subscribe, stack } = require('../services/pubsub')
const { updateBy: updateGuestsBy } = require('../models/v1/guests/repositories')

jest.mock('../services/pubsub')
jest.mock('../models/v1/guests/repositories')

require('./integrations')

describe('integrations listener', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should initialize subscriber', () => {
    expect(subscribe).toBeCalledWith('update:integration', expect.any(Function))
  })

  it('mailchimp: should update guests if settings were changed', async () => {
    const [fn] = stack['update:integration']

    const data = {
      name: 'mailchimp',
      accountId: 'accountId',
      old: {
        settings: {
          apiKey: 'old_apiKey',
          server: 'old_server',
        },
      },
      current: {
        settings: {
          apiKey: 'apiKey',
          server: 'server',
        },
      },
    }

    await expect(fn(null, data))
      .resolves.toBeUndefined()

    expect(updateGuestsBy).toBeCalledWith({ accountId: data.accountId }, { mailchimpId: null })
  })

  it('mailchimp: should do nothing for not changed data', async () => {
    const [fn] = stack['update:integration']

    const data = {
      name: 'mailchimp',
      accountId: 'accountId',
      old: {
        settings: {
          apiKey: 'apiKey',
          server: 'server',
        },
      },
      current: {
        settings: {
          apiKey: 'apiKey',
          server: 'server',
        },
      },
    }

    await expect(fn(null, data))
      .resolves.toBeUndefined()

    expect(updateGuestsBy).not.toBeCalled()
  })

  it('should do nothing for not mailchimp', async () => {
    const [fn] = stack['update:integration']

    const data = {
      name: 'other',
    }

    await expect(fn(null, data))
      .resolves.toBeUndefined()

    expect(updateGuestsBy).not.toBeCalled()
  })
})
