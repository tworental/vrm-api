const crypto = require('crypto')
const prettyBytes = require('pretty-bytes')

const stripe = require('../../../../../../services/stripe')
const { handler } = require('../../../../../../services/http')
const { selectBy } = require('../../../../../../models/v1/packages/repositories')
const { serialize } = require('../../../../../../models/v1/stripe/plans/serializers')

jest.mock('crypto')
jest.mock('pretty-bytes')
jest.mock('../../../../../../services/stripe')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/packages/repositories')
jest.mock('../../../../../../models/v1/stripe/plans/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/billings/plans', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const stripePackages = [
      { stripeId: 'package-1' },
      { stripeId: 'package-2' },
      { stripeId: 'package-3' },
    ]
    const prices = {
      data: [
        {
          id: 'price-1',
          product: {
            id: 'package-1',
            metadata: {
              packageName: 'professional',
            },
          },
        },
      ],
    }
    const data = [
      {
        features: [
          {
            group: 'main',
            id: undefined,
            name: 'account.module.storage.enabled',
            value: true,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.storage.quota',
            value: 1073741824,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.team.enabled',
            value: true,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.team.limit',
            value: 10,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.owners.enabled',
            value: true,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.rateSeasons.limit',
            value: 10,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.documents.invoices.enabled',
            value: true,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.statistics.enabled',
            value: true,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.websites.enabled',
            value: false,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.integrations.enabled',
            value: true,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.services.enabled',
            value: true,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.services.limit',
            value: 5,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.services.reminders.enabled',
            value: true,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.services.reminders.limit',
            value: 20,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.fees.enabled',
            value: true,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.fees.limit',
            value: 10,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.taxes.enabled',
            value: true,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.taxes.limit',
            value: 10,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.properties.limit',
            value: 50,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.properties.unitTypes.limit',
            value: 10,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.properties.units.limit',
            value: 5,
          },
          {
            group: 'main',
            id: undefined,
            name: 'account.module.properties.unitTypes.rateSeasons.limit',
            value: 5,
          },
          {
            group: 'channels',
            id: undefined,
            name: 'account.module.channels.enabled',
            value: true,
          },
          {
            group: 'channels',
            id: undefined,
            name: 'account.module.channels.channex.enabled',
            value: true,
          },
        ],
        id: 'price-1',
        popular: true,
        product: {
          id: 'package-1',
          metadata: {
            packageName: 'professional',
          },
        },
      },
    ]

    selectBy.mockResolvedValue(stripePackages)
    stripe.prices.list.mockResolvedValue(prices)
    serialize.mockImplementation((args) => args)

    const json = jest.fn().mockImplementation((args) => args)

    const digest = jest.fn()
    const updateFn = jest.fn().mockReturnValue({ digest })

    crypto.createHash.mockReturnValue({
      update: updateFn,
    })

    prettyBytes.mockImplementation((args) => args)

    await expect(httpHandler({}, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalled()
    expect(stripe.prices.list).toBeCalledWith({
      active: true,
      expand: ['data.tiers', 'data.product'],
    })
    expect(prettyBytes).toBeCalled()
    expect(crypto.createHash).toBeCalledWith('md5')
    expect(updateFn).toBeCalledWith('professional-main-0')
    expect(digest).toBeCalledWith('hex')
    expect(serialize).toBeCalled()
  })
})
