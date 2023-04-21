const { checkModule } = require('../../../../services/authorizers')

jest.mock('../../../../services/authorizers')

const authorizer = require('./authorizers')

describe('documents-invoices authorizers', () => {
  it('should have a proper authorizer data', () => {
    expect(authorizer.module).toEqual([
      'account.module.documents.invoices.enabled', checkModule,
    ])
  })
})
