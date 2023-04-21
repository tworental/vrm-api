const config = require('config')
const stripe = require('stripe')

const createError = require('./errors')

jest.mock('config')
jest.mock('stripe')
jest.mock('./errors')

const stripeService = require('./stripe')

describe('stripe service', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('init', () => {
    it('should initialize the Stripe plugin', () => {
      expect(stripeService.init()).toBeUndefined()

      expect(stripe).toBeCalledWith('payments.stripe.apiSecretKey', {
        apiVersion: 'payments.stripe.version',
        maxNetworkRetries: 'payments.stripe.maxNetworkRetries',
      })
    })

    it('should get the same instance on subsequent calls', () => {
      const connection = 'connection'

      stripe.mockReturnValue(connection)

      expect(stripeService.init(true)).toEqual(connection)
      expect(stripeService.init()).toEqual(connection)

      expect(stripe).toBeCalledTimes(1)
    })
  })

  describe('handler', () => {
    const params = {
      arg: 'argument',
    }

    it('should perform the callback function', async () => {
      const fn = jest.fn().mockImplementation((args) => args)

      await expect(stripeService.handler(fn)(params)).resolves.toEqual(params)

      expect(fn).toBeCalledWith(params)
    })

    it('should throw paramter_unknown error', async () => {
      const error = {
        type: 'StripeInvalidRequestError',
        statusCode: 400,
        raw: {
          code: 'parameter_unknown',
          message: 'Validation error',
        },
      }
      const errorMessage = 'Validation error'

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })
      const fn = jest.fn().mockRejectedValue(error)

      await expect(stripeService.handler(fn)(params)).rejects.toThrow(errorMessage)

      expect(createError).toBeCalledWith(error.statusCode, error.raw.message)
    })

    it('should throw validation failed error', async () => {
      const error = {
        type: 'StripeInvalidRequestError',
        statusCode: 401,
        raw: {
          code: '',
          message: ['Validation failed1', 'Validation failed2'],
          param: ['param1', 'param2'],
        },
      }
      const errorMessage = 'Validation failed'

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })
      const fn = jest.fn().mockRejectedValue(error)

      await expect(stripeService.handler(fn)(params)).rejects.toThrow(errorMessage)

      expect(createError).toBeCalledWith(error.statusCode, 'Validation failed', {
        errors: { [error.raw.param]: [error.raw.message] },
      })
    })

    it('default error when error.raw exists', async () => {
      const error = {
        type: '',
        statusCode: 404,
        raw: {
          code: 'parameter_unknown',
          message: 'Not found',
        },
        errorMessage: null,
      }
      const errorMessage = 'Not found'

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })
      const fn = jest.fn().mockRejectedValue(error)

      await expect(stripeService.handler(fn)(params)).rejects.toThrow(errorMessage)

      expect(createError).toBeCalledWith(error.statusCode, error.raw.message)
    })

    it('default error when error.raw does not exist', async () => {
      const error = {
        type: '',
        statusCode: 404,
        raw: null,
        errorMessage: 'Not found',
      }
      const errorMessage = 'Not found'

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })
      const fn = jest.fn().mockRejectedValue(error)

      await expect(stripeService.handler(fn)(params)).rejects.toThrow(errorMessage)

      expect(createError).toBeCalledWith(error.statusCode, error.errorMessage)
    })
  })

  describe('subscriptions', () => {
    it('should list stripe subscriptions', async () => {
      const result = 'result'
      const params = 'params'

      const list = jest.fn().mockResolvedValue(result)

      jest.spyOn(stripeService, 'init').mockReturnValue({
        subscriptions: { list },
      })

      await expect(stripeService.subscriptions.list(params)).resolves.toBe(result)

      expect(list).toBeCalledWith(params)
    })

    it('should delete a stripe subscription', async () => {
      const result = 'result'
      const subscriptionId = 'sub_36VrPHS2vVxJMq'

      const del = jest.fn().mockResolvedValue(result)

      jest.spyOn(stripeService, 'init').mockReturnValue({
        subscriptions: { del },
      })

      await expect(stripeService.subscriptions.del(subscriptionId)).resolves.toBe(result)

      expect(del).toBeCalledWith(subscriptionId)
    })
  })

  describe('customers', () => {
    it('should create a new customer', async () => {
      const result = 'result'
      const params = 'params'

      const create = jest.fn().mockResolvedValue(result)

      jest.spyOn(stripeService, 'init').mockReturnValue({
        customers: { create },
      })

      await expect(stripeService.customers.create(params)).resolves.toBe(result)

      expect(create).toBeCalledWith(params)
    })
  })

  describe('prices', () => {
    it('should list stripe prices', async () => {
      const result = 'result'
      const params = { key: 'value' }

      const list = jest.fn().mockResolvedValue(result)

      jest.spyOn(stripeService, 'init').mockReturnValue({
        prices: { list },
      })

      await expect(stripeService.prices.list(params)).resolves.toBe(result)

      expect(list).toBeCalledWith({
        currency: 'payments.defaultCurrency',
        ...params,
      })
    })
  })

  describe('webhookEvent', () => {
    it('should create a stripe webhook event', async () => {
      const event = 'event'
      const body = 'body'
      const signature = 'signature'

      const constructEvent = jest.fn().mockResolvedValue(event)
      const webhooks = { constructEvent }

      jest.spyOn(stripeService, 'init').mockReturnValue({ webhooks })

      await expect(stripeService.webhookEvent(body, signature)).resolves.toBe(event)

      expect(constructEvent).toBeCalledWith(body, signature, 'payments.stripe.webhookSecret')
      expect(config.get).toBeCalledWith('payments.stripe.webhookSecret')
    })
  })
})
