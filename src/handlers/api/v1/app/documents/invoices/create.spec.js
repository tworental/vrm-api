const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { i18n } = require('../../../../../../services/i18n')
const {
  selectOneBy, calculateInvoice, getInvoiceTitle, generateInvoice,
} = require('../../../../../../models/v1/documents/invoices/repositories')
const { getLimitByKey } = require('../../../../../../models/v1/limits/repositories')
const {
  selectOneBy: selectInvoiceSettings,
} = require('../../../../../../models/v1/documents/invoices/settings/repositories')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/documents/invoices/schema')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/i18n')
jest.mock('../../../../../../models/v1/documents/invoices/repositories')
jest.mock('../../../../../../models/v1/documents/invoices/settings/repositories')
jest.mock('../../../../../../models/v1/documents/invoices/serializers')
jest.mock('../../../../../../models/v1/limits/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/documents/invoices', () => {
  const account = { settings: { locale: 'en_US' } }
  const user = { accountId: 2 }
  const body = { key: 'value' }
  const data = { some: 'data', invoiceNo: 'XXXX', invoiceDate: '2020-01-01' }

  const invoiceId = 10000

  const payload = {
    name: 'key',
    invoiceNo: 'XXXX',
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const invoiceType = 'invoice'
    const invoiceTitle = 'Invoice'
    const id = 1
    const limits = 'limits'

    const json = jest.fn().mockImplementation((args) => args)
    const t = jest.fn().mockImplementation((args) => args)

    i18n.mockReturnValue(t)

    validate.mockResolvedValue({
      ...payload, invoiceId, invoiceType,
    })
    selectOneBy.mockResolvedValue(null)
    calculateInvoice.mockReturnValue(data)
    getInvoiceTitle.mockReturnValue(invoiceTitle)
    generateInvoice.mockResolvedValue(id)
    selectInvoiceSettings.mockResolvedValue(null)
    getLimitByKey.mockReturnValue(['en', 'pl'])

    await expect(httpHandler({
      body, limits, user, account,
    }, { json }))
      .resolves.toEqual({ data: { id } })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId: user.accountId, invoiceNo: payload.invoiceNo })
    expect(createError).not.toBeCalled()
    expect(calculateInvoice).toBeCalledWith({ ...payload, invoiceType })
    expect(i18n).toBeCalledWith('en', { locales: ['en', 'pl'] })
    expect(getLimitByKey).toBeCalledWith('account.module.documents.invoices.languages.list', limits, ['en'])
    expect(t).toBeCalledWith(invoiceTitle)
    expect(getInvoiceTitle).toBeCalledWith(invoiceType)
    expect(generateInvoice).toBeCalledWith({
      ...data,
      invoiceTitle,
      accountId: user.accountId,
    }, { locale: 'en_US', t: expect.any(Function) })
    expect(selectInvoiceSettings).toBeCalledWith({ accountId: user.accountId })
    expect(json).toBeCalledWith({ data: { id } })
    expect(cache.del).toBeCalledWith(['accounts.2.invoices.pagination.*'])
  })

  it('should thrown an error when invoice is a correction and parent invoice does not exists', async () => {
    const errorMessage = 'Validation Failed'

    const invoiceType = 'correction'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({
      ...payload, invoiceId, invoiceType,
    })
    selectOneBy.mockResolvedValueOnce(null)
    selectOneBy.mockResolvedValueOnce(null)

    await expect(httpHandler({ body, user, account }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId: user.accountId, invoiceNo: payload.invoiceNo })
    expect(selectOneBy).toBeCalledWith({ accountId: user.accountId, id: invoiceId })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { invoiceId: ['notExists'] },
    })
    expect(calculateInvoice).not.toBeCalled()
    expect(getInvoiceTitle).not.toBeCalled()
    expect(generateInvoice).not.toBeCalled()
  })

  it('should thrown an error when invoice number already exists', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValue('invoice')

    await expect(httpHandler({ body, user, account }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId: user.accountId, invoiceNo: payload.invoiceNo })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { invoiceNo: ['exists'] },
    })
    expect(calculateInvoice).not.toBeCalled()
    expect(getInvoiceTitle).not.toBeCalled()
    expect(generateInvoice).not.toBeCalled()
  })
})
