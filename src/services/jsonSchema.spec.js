const { default: Ajv } = require('ajv')
const addFormats = require('ajv-formats')
const addKeywords = require('ajv-keywords')

jest.mock('ajv')
jest.mock('ajv-formats')
jest.mock('ajv-keywords')

const validateService = require('./jsonSchema')

describe('#json-schema', () => {
  const addKeyword = jest.fn()
  const validateMock = jest.fn()

  const errors = [{
    keyword: 'required',
    instancePath: '/clients/0',
    schemaPath: '#/properties/clients/items/required',
    params: { missingProperty: 'name' },
    message: 'should have required property \'name\'',
  },
  {
    keyword: 'required',
    instancePath: '/clients/0',
    schemaPath: '#/properties/clients/items/required',
    params: { missingProperty: 'address' },
    message: 'should have required property \'address\'',
  },
  {
    keyword: 'required',
    instancePath: '/clients/0',
    schemaPath: '#/properties/clients/items/required',
    params: { missingProperty: 'postCode' },
    message: 'should have required property \'postCode\'',
  },
  {
    keyword: 'required',
    instancePath: '/clients/0',
    schemaPath: '#/properties/clients/items/required',
    params: { missingProperty: 'municipality' },
    message: 'should have required property \'municipality\'',
  },
  {
    keyword: 'maximum',
    instancePath: '/downPaymentRepaymentDays',
    schemaPath: '#/properties/downPaymentRepaymentDays/maximum',
    params: { comparison: '<=', limit: 5, exclusive: false },
    message: 'should be <= 5',
  },
  {
    keyword: 'minimum',
    instancePath: '/downPaymentRepaymentDays',
    schemaPath: '#/properties/downPaymentRepaymentDays/minimum',
    params: { comparison: '>=', limit: 10, exclusive: false },
    message: 'should be >= 10',
  }]

  beforeEach(() => {
    Ajv.mockImplementation(() => ({
      validate: validateMock,
      addKeyword,
      errors,
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should validate successfully', async () => {
    const ajv = new Ajv()

    addFormats.mockReturnValue(true)
    ajv.validate.mockReturnValue(true)

    const schema = { schema: 'schema' }
    const data = { data: 'data' }
    const options = { options: 'options' }

    await expect(validateService.validate(data, { schema }, options)).resolves.toEqual(true)

    expect(Ajv).toBeCalledWith(options)
    expect(addFormats).toBeCalledWith(ajv)
    expect(addKeywords).toBeCalledWith(ajv, ['transform'])
    expect(validateMock).toBeCalledWith(schema, data)
  })

  it('should validate successfully with validators', async () => {
    const ajv = new Ajv()

    addFormats.mockReturnValue(true)
    ajv.validate.mockReturnValue(true)

    const schema = { schema: 'schema' }
    const data = { data: 'data' }
    const options = { allErrors: true }

    const validators = {
      isValidIBAN: {
        keyword: 'isValidIBAN',
        schema: false,
        validate: () => true,
      },
      isValidBIC: {
        keyword: 'isValidBIC',
        schema: false,
        validate: () => true,
      },
    }

    await expect(
      validateService.validate(
        data,
        {
          schema,
          validators,
        },
        options,
      ),
    ).resolves.toEqual(true)

    expect(Ajv).toBeCalledWith(options)
    expect(addFormats).toBeCalledWith(ajv)
    expect(addKeywords).toBeCalledWith(ajv, ['transform'])
    expect(addKeyword).toHaveBeenNthCalledWith(1, validators.isValidIBAN)
    expect(addKeyword).toHaveBeenNthCalledWith(2, validators.isValidBIC)
    expect(validateMock).toBeCalledWith(schema, data)
  })

  it('should normalise the errors', () => {
    expect(validateService.normaliseError(errors)).toEqual({
      'clients.0.name': [
        {
          keyword: 'required',
          instancePath: 'clients.0.name',
          schemaPath: '#/properties/clients/items/required',
          params: {
            missingProperty: 'name',
          },
          message: 'should have required property \'name\'',
        },
      ],
      'clients.0.address': [
        {
          keyword: 'required',
          instancePath: 'clients.0.address',
          schemaPath: '#/properties/clients/items/required',
          params: {
            missingProperty: 'address',
          },
          message: 'should have required property \'address\'',
        },
      ],
      'clients.0.postCode': [
        {
          keyword: 'required',
          instancePath: 'clients.0.postCode',
          schemaPath: '#/properties/clients/items/required',
          params: {
            missingProperty: 'postCode',
          },
          message: 'should have required property \'postCode\'',
        },
      ],
      'clients.0.municipality': [
        {
          keyword: 'required',
          instancePath: 'clients.0.municipality',
          schemaPath: '#/properties/clients/items/required',
          params: {
            missingProperty: 'municipality',
          },
          message: 'should have required property \'municipality\'',
        },
      ],
      downPaymentRepaymentDays: [
        {
          keyword: 'maximum',
          instancePath: 'downPaymentRepaymentDays',
          schemaPath: '#/properties/downPaymentRepaymentDays/maximum',
          params: {
            comparison: '<=',
            limit: 5,
            exclusive: false,
          },
          message: 'should be <= 5',
        },
        {
          keyword: 'minimum',
          instancePath: 'downPaymentRepaymentDays',
          schemaPath: '#/properties/downPaymentRepaymentDays/minimum',
          params: {
            comparison: '>=',
            limit: 10,
            exclusive: false,
          },
          message: 'should be >= 10',
        },
      ],
    })
  })

  it('should format errors', async () => {
    const normalisedErrors = {
      name: [
        {
          keyword: 'required',
          instancePath: 'clients.0.name',
          schemaPath: '#/properties/clients/items/required',
          params: {
            missingProperty: 'name',
          },
          message: 'should have required property \'name\'',
        },
        {
          keyword: 'type',
          instancePath: 'clients.0.name',
          schemaPath: '#/properties/clients/items/required',
          params: {
            type: 'number,null',
          },
          message: 'Wrong type',
        },
      ],
    }
    expect(validateService.formatErrors(normalisedErrors)).toEqual({
      name: [
        {
          name: 'required',
          message: 'should have required property \'name\'',
          params: {
            missingProperty: 'name',
          },
        },
        {
          name: 'type.number_or_null',
          message: 'Wrong type',
          params: {
            type: 'number,null',
          },
        },
      ],
    })
  })

  it('should fail to validate', async () => {
    const ajv = new Ajv()
    ajv.validate.mockRejectedValue({ errors })

    const normalisedErrors = { data: 'normalisedErrors' }

    jest.spyOn(validateService, 'normaliseError').mockReturnValue(normalisedErrors)

    Ajv.mockImplementation(() => ({
      validate: validateMock,
      addKeyword: jest.fn(),
      errors,
    }))

    Ajv.ValidationError = jest.fn().mockImplementation(() => {
      throw new Error('error')
    })

    await expect(validateService.validate({}, {})).rejects.toThrowError(Error('error'))
  })

  it('should throw an original error', async () => {
    const errorMessage = 'Fatal Error'

    const ajv = new Ajv()

    ajv.validate.mockRejectedValue(new Error(errorMessage))

    const normaliseError = jest.spyOn(validateService, 'normaliseError')

    await expect(validateService.validate({}, {})).rejects.toThrow(errorMessage)

    expect(normaliseError).not.toBeCalled()
  })
})
