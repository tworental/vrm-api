const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const {
  updateBy: updateFeeBy,
  selectOneBy: selectFeeBy,
} = require('../../../../../models/v1/fees/repositories')
const {
  selectOneBy: selectDictFeeBy,
} = require('../../../../../models/v1/dict-fees/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/fees/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/fees/repositories')
jest.mock('../../../../../models/v1/dict-fees/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/fees/:id', () => {
  const accountId = 'accountId'
  const id = 'id'
  const body = 'body'
  const results = { id }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const statusCode = 200

    const payload = {
      dictFeeId: 1,
      name: 'name',
    }

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockResolvedValue()

    validate.mockResolvedValue(payload)
    selectFeeBy.mockResolvedValueOnce(results)
    selectFeeBy.mockReturnValueOnce({ where })
    selectDictFeeBy.mockResolvedValue('dictFee')
    updateFeeBy.mockResolvedValue()

    await expect(httpHandler({ user: { accountId }, params: { id }, body }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectDictFeeBy).toBeCalledWith({ id: payload.dictFeeId })
    expect(selectFeeBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectFeeBy).toHaveBeenNthCalledWith(2, { accountId, name: payload.name })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(updateFeeBy).toBeCalledWith({ id: results.id }, payload)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error when resource with the same name already exist', async () => {
    const errorMessage = 'Validation Failed'

    const payload = {
      name: 'name',
    }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockResolvedValue('differentFee')

    selectFeeBy.mockResolvedValueOnce(results)
    selectFeeBy.mockReturnValueOnce({ where })
    validate.mockResolvedValue(payload)
    selectDictFeeBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id }, body }))
      .rejects.toThrow(errorMessage)

    expect(selectFeeBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectFeeBy).toHaveBeenNthCalledWith(2, { accountId, name: payload.name })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectDictFeeBy).not.toBeCalled()
    expect(updateFeeBy).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { name: ['unique'] },
    })
  })

  it('should throw an error when dictionary does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ dictFeeId: 1000 })
    selectFeeBy.mockResolvedValueOnce('fee')
    selectDictFeeBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id }, body }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectFeeBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectDictFeeBy).toBeCalledWith({ id: 1000 })
    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { dictFeeId: ['notExists'] },
    })
  })

  it('should throw an error when resource does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({})
    selectFeeBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id }, body }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectFeeBy).toBeCalledWith({ accountId, id })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
