const { checkModule } = require('../../../services/authorizers')

jest.mock('../../../services/authorizers')

const authorizer = require('./authorizers')

describe('sales-channels authorizers', () => {
  it('should have a proper authorizer data', () => {
    expect(authorizer.module).toEqual([
      'account.module.salesChannels.enabled', checkModule,
    ])
  })
})
