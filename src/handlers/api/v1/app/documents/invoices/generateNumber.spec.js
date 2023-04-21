const { handler } = require('../../../../../../services/http')
const {
  generateInvoiceNo,
} = require('../../../../../../models/v1/documents/invoices/repositories')

jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/documents/invoices/repositories')

const httpHandler = require('./generateNumber')

describe('GET /v1/app/documents/invoices/generate-number', () => {
  it('should generate an invoice number', async () => {
    const user = { id: 1, accountId: 1000 }

    const results = 'results'
    const response = { data: results }

    generateInvoiceNo.mockReturnValueOnce(results)

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
    expect(generateInvoiceNo).toBeCalledWith(1000)
  })
})
