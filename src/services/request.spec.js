const fetch = require('node-fetch')

const createError = require('./errors')

jest.mock('node-fetch')
jest.mock('./errors')

const requestService = require('./request')

describe('request service', () => {
  const url = 'url'
  const headers = { header: 'header' }
  const body = 'body'
  const results = 'data'

  const json = jest.fn()

  beforeEach(() => {
    json.mockResolvedValue('data')
    fetch.mockResolvedValue({ ok: 1, json })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should send a get request', async () => {
    await expect(requestService.get(url, {})).resolves.toEqual(results)

    expect(fetch(url, {
      method: 'GET',
      body: undefined,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }))
    expect(json).toBeCalled()
  })

  it('should send a post request', async () => {
    await expect(requestService.post(url, body, {})).resolves.toEqual(results)

    expect(fetch(url, {
      method: 'POST',
      body,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }))
    expect(json).toBeCalled()
  })

  it('should send a put request', async () => {
    await expect(requestService.put(url, body, {})).resolves.toEqual(results)

    expect(fetch(url, {
      method: 'PUT',
      body,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }))
    expect(json).toBeCalled()
  })

  it('should send a patch request', async () => {
    await expect(requestService.patch(url, body, {})).resolves.toEqual(results)

    expect(fetch(url, {
      method: 'PATCH',
      body,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }))
    expect(json).toBeCalled()
  })

  it('should send a delete request', async () => {
    await expect(requestService.delete(url, null, {})).resolves.toEqual(results)

    expect(fetch(url, {
      method: 'DELETE',
      body: undefined,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }))
    expect(json).toBeCalled()
  })

  it('should throw an error for get request', async () => {
    const errorMessage = 'Error'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    fetch.mockResolvedValue({ status: 400, statusText: 'error', json })

    await expect(requestService.get(url, {}))
      .rejects.toThrow(errorMessage)

    expect(fetch(url, {
      method: 'GET',
      body: undefined,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }))
    expect(json).toBeCalled()
    expect(createError).toBeCalledWith(400, 'error', 'data')
  })
})
