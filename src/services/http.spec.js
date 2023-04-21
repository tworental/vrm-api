const qs = require('qs')

const { languageCode } = require('./i18n')

jest.mock('qs')
jest.mock('./i18n')

const httpService = require('./http')

describe('http service', () => {
  const headers = {
    'accept-language': 'en-US',
  }

  const query = {}

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should response successfully', async () => {
    const fn = jest.fn().mockImplementation(() => {})
    const next = jest.fn()

    languageCode.mockReturnValue('en')

    expect(await httpService.handler(fn)({ headers, query }, {}, next)).toBeUndefined()

    expect(languageCode).toBeCalledWith('en-US')
    expect(fn).toBeCalledWith({
      files: {},
      headers: {
        ...headers,
        lang: 'en',
      },
      query,
    }, {}, next)
  })

  it('should parse body when the content-type equal multipart/form-data', async () => {
    const fn = jest.fn().mockImplementation(() => {})
    const next = jest.fn()
    const body = { 'key[0]': 'value' }

    languageCode.mockReturnValue('de')

    qs.parse.mockReturnValue({ key: ['value'] })

    expect(await httpService.handler(fn)({
      headers: { 'content-type': 'multipart/form-data' }, body, query,
    }, {}, next)).toBeUndefined()

    expect(qs.parse).toBeCalledWith(body)
    expect(fn).toBeCalledWith({
      body: { key: ['value'] },
      files: {},
      headers: {
        lang: 'de',
        'x-org-id': null,
        'content-type': 'multipart/form-data',
      },
      query,
    }, {}, next)
  })

  it('should response successfully with files', async () => {
    const fn = jest.fn().mockImplementation(() => {})
    const next = jest.fn()

    const files = {
      files: { file: 'file' },
    }

    languageCode.mockReturnValue('en')

    expect(await httpService.handler(fn)({ headers, files, query }, {}, next)).toBeUndefined()

    expect(languageCode).toBeCalledWith('en-US')
    expect(fn).toBeCalledWith({
      files,
      headers: {
        ...headers,
        lang: 'en',
      },
      query,
    }, {}, next)
  })

  it('should fail when error appears', async () => {
    const error = new Error('Fatal Error')

    const fn = jest.fn().mockRejectedValue(error)
    const next = jest.fn()

    expect(await httpService.handler(fn)({ headers, query }, {}, next)).toBeUndefined()

    expect(next).toBeCalledWith(error)
  })

  it('should convert ids object to array', async () => {
    const queryWithIds = { ids: { 0: 1, 1: 2, 2: 3 } }
    const queryWithIdsArray = { ids: [1, 2, 3] }

    const fn = jest.fn()
    const next = jest.fn()

    expect(await httpService.handler(fn)({ headers, query: queryWithIds }, {}, next)).toBeUndefined()

    expect(fn).toBeCalledWith({
      files: {},
      headers,
      query: queryWithIdsArray,
    }, {}, next)
  })
})
