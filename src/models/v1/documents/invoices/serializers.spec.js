const { serialize } = require('../../../../services/serializers')

jest.mock('../../../../services/serializers')

const serializers = require('./serializers')

describe('invoices serializers', () => {
  const data = 'data'
  const results = 'results'

  it('should serialize item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_ITEM_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'status',
      'invoiceId',
      'invoiceNo',
      'invoiceType',
      'invoiceTitle',
      'invoiceDate',
      'invoiceDueDate',
      'sellerName',
      'sellerAddress',
      'sellerZip',
      'sellerCity',
      'sellerCountry',
      'sellerTaxId',
      'buyerName',
      'buyerAddress',
      'buyerZip',
      'buyerCity',
      'buyerCountry',
      'buyerTaxId',
      'paymentType',
      'taxNotation',
      'invoiceNote',
      'invoiceItems',
      'currency',
      'subtotalAmount',
      'totalAmount',
      'isPaid',
      's3InvoicePath',
      'logoBase64',
      'createdAt',
      'updatedAt',
    ], data)
  })

  it('should serialize collection item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_COLLECTION_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'isPaid',
      'invoiceId',
      'invoiceNo',
      'status',
      'invoiceType',
      'invoiceTitle',
      'invoiceDate',
      'invoiceDueDate',
      'buyerName',
      'currency',
      'subtotalAmount',
      'totalAmount',
      'createdAt',
      'updatedAt',
    ], data)
  })
})
