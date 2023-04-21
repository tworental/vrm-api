const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const {
  create: createFee,
} = require('../../../../../models/v1/fees/repositories')
const {
  selectOneBy: selectDictFeeBy,
} = require('../../../../../models/v1/dict-fees/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/fees/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/fees/repositories')
jest.mock('../../../../../models/v1/dict-fees/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/fees', () => {
  const accountId = 'accountId'

  it('should create a resource', async () => {
    const body = 'body'
    const feeId = 'feeId'

    const payload = {
      dictFeeId: 1,
      key: 'value',
    }

    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })

    validate.mockResolvedValue(payload)
    createFee.mockResolvedValue(feeId)
    selectDictFeeBy.mockResolvedValue('dictFee')

    await expect(httpHandler({ user: { accountId }, body }, { status }))
      .resolves.toEqual({ data: { id: feeId } })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectDictFeeBy).toBeCalledWith({ id: payload.dictFeeId })
    expect(createFee).toBeCalledWith({ ...payload, accountId })
    expect(status).toBeCalledWith(201)
    expect(json).toBeCalledWith({ data: { id: feeId } })
  })

  it('should throw an error when dictionary does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectDictFeeBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, body: { dictFeeId: 1 } }))
      .rejects.toThrow(errorMessage)

    expect(selectDictFeeBy).toBeCalledWith({ id: 1 })
    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { dictFeeId: ['notExists'] },
    })
  })
})
