const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { i18n } = require('../../../../../../services/i18n')
const {
  updateBy, selectOneBy, calculateInvoice, getInvoiceTitle,
} = require('../../../../../../models/v1/documents/invoices/repositories')
const {
  selectOneBy: selectInvoiceSettings,
} = require('../../../../../../models/v1/documents/invoices/settings/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/documents/invoices/schema')
const { getLimitByKey } = require('../../../../../../models/v1/limits/repositories')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/i18n')
jest.mock('../../../../../../models/v1/documents/invoices/repositories')
jest.mock('../../../../../../models/v1/documents/invoices/settings/repositories')
jest.mock('../../../../../../models/v1/limits/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/documents/invoices/:id', () => {
  const id = 1
  const account = { settings: { locale: 'en_US' } }
  const user = { accountId: 2 }
  const body = { key: 'value' }
  const data = { some: 'data' }
  const limits = 'limits'

  const invoice = 'invoice'

  const payload = { name: 'key', invoiceNo: 'XXX' }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const statusCode = 200

    const invoiceType = 'invoice'

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockResolvedValue(null)
    const t = jest.fn().mockImplementation((args) => args)

    i18n.mockReturnValue(t)
    selectInvoiceSettings.mockResolvedValue(null)
    getLimitByKey.mockReturnValue(['en', 'pl'])
    validate.mockResolvedValue({ ...payload, invoiceType })
    selectOneBy.mockResolvedValueOnce(invoice)
    selectOneBy.mockReturnValueOnce({ where })
    calculateInvoice.mockReturnValue(data)
    getInvoiceTitle.mockReturnValue('correction')

    await expect(httpHandler({
      body, params: { id }, account, user, limits,
    }, { sendStatus })).resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toHaveBeenNthCalledWith(1, { accountId: user.accountId, id })
    expect(selectOneBy).toHaveBeenNthCalledWith(2, { accountId: user.accountId, invoiceNo: payload.invoiceNo })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(createError).not.toBeCalled()
    expect(calculateInvoice).toBeCalledWith({ ...payload, invoiceType })
    expect(getInvoiceTitle).toBeCalledWith(invoiceType)
    expect(updateBy).toBeCalledWith({ id }, data)
    expect(sendStatus).toBeCalledWith(statusCode)
    expect(selectInvoiceSettings).toBeCalledWith({ accountId: user.accountId })
    expect(getLimitByKey).toBeCalledWith('account.module.documents.invoices.languages.list', limits, ['en'])
    expect(i18n).toBeCalledWith('en', { locales: ['en', 'pl'] })
    expect(t).toBeCalledWith('correction')
    expect(cache.del).toBeCalledWith(['accounts.2.invoices.pagination.*'])
  })

  it('should thrown an error when resource could not be found', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({
      body, params: { id }, account, user,
    })).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ id, accountId: user.accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
    expect(updateBy).not.toBeCalled()
  })

  it('should thrown an error when invoice is a correction and parent invoice does not exists', async () => {
    const errorMessage = 'Validation Failed'

    const invoiceId = 1000
    const invoiceType = 'correction'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockResolvedValue(null)

    validate.mockResolvedValue({
      ...payload, invoiceId, invoiceType,
    })
    selectOneBy.mockResolvedValueOnce(invoice)
    selectOneBy.mockReturnValueOnce({ where })
    selectOneBy.mockResolvedValueOnce(null)

    await expect(httpHandler({
      body, params: { id }, user, account,
    })).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toHaveBeenNthCalledWith(1, { accountId: user.accountId, id })
    expect(selectOneBy).toHaveBeenNthCalledWith(2, { accountId: user.accountId, invoiceNo: payload.invoiceNo })
    expect(selectOneBy).toHaveBeenNthCalledWith(3, { accountId: user.accountId, id: invoiceId })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { invoiceId: ['notExists'] },
    })
    expect(calculateInvoice).not.toBeCalled()
    expect(getInvoiceTitle).not.toBeCalled()
    expect(updateBy).not.toBeCalled()
  })

  it('should thrown an error when invoice number already exists', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockResolvedValue(invoice)

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValueOnce(invoice)
    selectOneBy.mockReturnValueOnce({ where })

    await expect(httpHandler({
      body, params: { id }, user, account,
    })).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ id, accountId: user.accountId })
    expect(selectOneBy).toBeCalledWith({ accountId: user.accountId, invoiceNo: payload.invoiceNo })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { invoiceNo: ['exists'] },
    })
    expect(updateBy).not.toBeCalled()
  })
})
