const config = require('config')

const createError = require('./errors')
const { validate, formatErrors } = require('./jsonSchema')

jest.mock('config')
jest.mock('./errors')
jest.mock('./database')
jest.mock('./jsonSchema')

const validateService = require('./validate')

describe('#validate', () => {
  const validators = {
    isValidIBAN: {
      keyword: 'isValidIBAN',
      schema: false,
      type: 'string',
      validate: expect.any(Function),
      error: {
        message: 'Invalid IBAN number',
      },
    },
    isValidBIC: {
      keyword: 'isValidBIC',
      schema: false,
      type: 'string',
      validate: expect.any(Function),
      error: {
        message: 'Invalid BIC',
      },
    },
    isValidVAT: {
      keyword: 'isValidVAT',
      schema: true,
      type: 'string',
      validate: expect.any(Function),
      error: {
        message: 'Invalid VAT ID number',
      },
    },
  }

  beforeEach(() => {
    config.get.mockImplementation(() => ({
      allErrors: true,
      removeAdditional: true,
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should validate successfully with default params', async () => {
    const data = { data: 'data' }

    validate.mockResolvedValue(data)

    await expect(validateService.validate(data)).resolves.toEqual(data)

    expect(validate).toBeCalledWith(
      data,
      {
        schema: {
          $async: true,
        },
        validators,
      },
      { allErrors: true, removeAdditional: true },
    )
    expect(config.get).toHaveBeenNthCalledWith(1, 'validation')
  })

  it('should validate successfully', async () => {
    const rules = { schema: { key: 'value' } }
    const data = { data: 'data' }
    const options = { options: 'options' }

    validate.mockResolvedValue(data)

    await expect(validateService.validate(data, rules, options)).resolves.toEqual(data)

    expect(validate).toBeCalledWith(
      data,
      {
        schema: {
          $async: true,
          ...rules.schema,
        },
        validators,
      },
      { allErrors: true, removeAdditional: true, ...options },
    )
  })

  it('should fail to validate', async () => {
    const errors = ['errors']
    const formattedErrors = ['formattedErrors']
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockRejectedValue({ errors })

    formatErrors.mockReturnValue(formattedErrors)

    await expect(validateService.validate()).rejects.toThrow(errorMessage)

    expect(formatErrors).toBeCalledWith(errors)
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: formattedErrors,
    })
  })

  it('should throw an original error', async () => {
    const errorMessage = 'Fatal Error'

    validate.mockRejectedValue(new Error(errorMessage))

    await expect(validateService.validate()).rejects.toThrow(errorMessage)

    expect(formatErrors).not.toBeCalled()
    expect(createError).not.toBeCalled()
  })
})
