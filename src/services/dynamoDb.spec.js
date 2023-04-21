const { DynamoDB: { DocumentClient } } = require('aws-sdk')

const { getItem, scanItems, putItem } = require('./dynamoDb')

jest.mock('aws-sdk')

describe('dynamoDb service', () => {
  it('should get an item in a table', async () => {
    const promise = jest.fn().mockResolvedValue()
    const get = jest.fn().mockReturnValue({
      promise,
    })
    DocumentClient.mockImplementation(() => ({
      get,
    }))

    const options = { data: 'options' }
    await expect(getItem(options)).resolves.toBeUndefined()

    expect(get).toBeCalledWith(options)
    expect(promise).toBeCalled()
  })

  it('should scan items in a table', async () => {
    const promise = jest.fn().mockResolvedValue()
    const scan = jest.fn().mockReturnValue({
      promise,
    })
    DocumentClient.mockImplementation(() => ({
      scan,
    }))

    const options = { data: 'options' }
    await expect(scanItems(options)).resolves.toBeUndefined()

    expect(scan).toBeCalledWith(options)
    expect(promise).toBeCalled()
  })

  it('should put an item to the table', async () => {
    const promise = jest.fn().mockResolvedValue()
    const put = jest.fn().mockReturnValue({
      promise,
    })
    DocumentClient.mockImplementation(() => ({
      put,
    }))

    const options = { data: 'options' }
    await expect(putItem(options)).resolves.toBeUndefined()

    expect(put).toBeCalledWith(options)
    expect(promise).toBeCalled()
  })
})
