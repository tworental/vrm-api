const invNum = require('invoice-number')
const dayjs = require('./dayjs')

jest.mock('invoice-number')
jest.mock('./dayjs')

const service = require('./invoice-number')

describe('invoice-number service', () => {
  it('should return string based on lastInvoiceNumber', () => {
    invNum.InvoiceNumber.next.mockReturnValue('invoice-2')

    expect(service.generate('invoice-1')).toBe('invoice-2')
    expect(invNum.InvoiceNumber.next).toBeCalledWith('invoice-1')
  })

  it('should return populated pattern with default number', () => {
    const format = jest.fn()
      .mockReturnValueOnce('2021')
      .mockReturnValueOnce('01')

    dayjs.mockReturnValue({ format })

    expect(service.populatePattern('{YYYY}/{MM}/I-{NN}')).toBe('2021/01/I-01')
  })

  it('should return populated pattern with defined number', () => {
    const format = jest.fn()
      .mockReturnValueOnce('2021')
      .mockReturnValueOnce('01')

    dayjs.mockReturnValue({ format })

    expect(service.populatePattern('{YYYY}/{MM}/I-{NN}', 100)).toBe('2021/01/I-100')
  })
})
