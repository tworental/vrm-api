const { onlyKeys } = require('../../../services/utility')
const {
  create: createBookingFee,
  selectBy: selectBookingFeesBy,
  selectOneBy: selectBookingFeeBy,
  updateBy: updateBookingFeeBy,
  deleteBy: deleteBookingFeeBy,
} = require('../booking-fees/repositories')
const {
  create: createBookingTax,
  selectBy: selectBookingTaxesBy,
  selectOneBy: selectBookingTaxBy,
  updateBy: updateBookingTaxBy,
  deleteBy: deleteBookingTaxBy,
} = require('../booking-taxes/repositories')
const {
  create: createBookingService,
  selectBy: selectBookingServicesBy,
  selectOneBy: selectBookingServiceBy,
  updateBy: updateBookingServiceBy,
  deleteBy: deleteBookingServiceBy,
} = require('../booking-services/repositories')

jest.mock('../../../services/utility')
jest.mock('../booking-fees/repositories')
jest.mock('../booking-taxes/repositories')
jest.mock('../booking-services/repositories')

const repository = require('./repositories')

describe('booking-extras repositories', () => {
  describe('calculateExtras', () => {
    it('should return array of extras with calculations', () => {
      const nightlyRates = {
        '2021-02-01': 50,
        '2021-02-02': 50,
        '2021-02-03': 50,
        '2021-02-04': 50,
        '2021-02-05': 50,
      }
      const currencyExchangeRates = {
        rates: {
          eur: 1,
          usd: 1.2,
          gbr: 2,
        },
      }
      const currency = 'GBR'
      const guests = 3
      const totalNights = Object.keys(nightlyRates).length

      const extras = [
        {
          amount: 20,
          quantity: 1,
          taxIncluded: 0,
          taxValue: 20,
          currency: 'USD',
          rateType: 'fixed',
          chargeType: 'perNight',
        },
        {
          amount: 20,
          quantity: 1,
          taxIncluded: 0,
          taxValue: 20,
          currency: 'EUR',
          rateType: 'fixed',
          chargeType: 'singleCharge',
          frequency: 'perNight',
        },
        {
          amount: 20,
          quantity: 1,
          taxIncluded: 0,
          taxValue: 20,
          currency: 'USD',
          rateType: 'fixed',
          chargeType: 'singleCharge',
          frequency: 'perStay',
        },
        {
          amount: 20,
          quantity: 1,
          taxIncluded: 0,
          taxValue: 20,
          currency: 'USD',
          rateType: 'fixed',
          chargeType: 'perPerson',
          frequency: 'perNight',
        },
        {
          amount: 20,
          quantity: 1,
          taxIncluded: 1,
          taxValue: 20,
          currency: 'GBR',
          rateType: 'fixed',
          chargeType: 'perPerson',
          frequency: 'perStay',
        },
        {
          amount: 20,
          quantity: 1,
          taxIncluded: 0,
          percentage: 25,
          taxValue: 20,
          currency: 'USD',
          rateType: 'percentage',
        },
        {
          percentage: 25,
          currency: 'USD',
          rateType: 'percentage',
        },
      ]

      expect(repository.calculateExtras(nightlyRates, currencyExchangeRates, currency, guests, totalNights)(extras))
        .toEqual([
          {
            amount: 20,
            quantity: 1,
            taxIncluded: 0,
            taxValue: 20,
            currency: 'GBR',
            rateType: 'fixed',
            chargeType: 'perNight',
            currencyRate: 1.6666666666666667,
            totalAmount: 120,
            totalAmountExchanged: 200,
          },
          {
            amount: 20,
            quantity: 1,
            taxIncluded: 0,
            taxValue: 20,
            currency: 'GBR',
            currencyRate: 2,
            rateType: 'fixed',
            chargeType: 'singleCharge',
            frequency: 'perNight',
            totalAmount: 120,
            totalAmountExchanged: 240,
          },
          {
            amount: 20,
            quantity: 1,
            taxIncluded: 0,
            taxValue: 20,
            currency: 'GBR',
            currencyRate: 1.6666666666666667,
            rateType: 'fixed',
            chargeType: 'singleCharge',
            frequency: 'perStay',
            totalAmount: 24,
            totalAmountExchanged: 40,
          },
          {
            amount: 20,
            quantity: 1,
            taxIncluded: 0,
            taxValue: 20,
            currencyRate: 1.6666666666666667,
            currency: 'GBR',
            rateType: 'fixed',
            chargeType: 'perPerson',
            frequency: 'perNight',
            totalAmount: 360,
            totalAmountExchanged: 600,
          },
          {
            amount: 20,
            quantity: 1,
            taxIncluded: 1,
            taxValue: 20,
            currency: 'GBR',
            currencyRate: 1,
            rateType: 'fixed',
            chargeType: 'perPerson',
            frequency: 'perStay',
            totalAmount: 60,
            totalAmountExchanged: 60,
          },
          {
            amount: 20,
            quantity: 1,
            taxIncluded: 0,
            percentage: 25,
            taxValue: 20,
            currency: 'GBR',
            currencyRate: 1.6666666666666667,
            rateType: 'percentage',
            totalAmount: 75,
            totalAmountExchanged: 125,
          },
          {
            amount: 0,
            quantity: 1,
            percentage: 25,
            currency: 'GBR',
            currencyRate: 1.6666666666666667,
            rateType: 'percentage',
            totalAmount: 62.5,
            totalAmountExchanged: 104.1666666666666667,
          },
        ])
    })

    it('should return array of extras with calculations if there is no rates', () => {
      const nightlyRates = {
        '2021-02-01': 50,
        '2021-02-02': 50,
        '2021-02-03': 50,
        '2021-02-04': 50,
        '2021-02-05': 50,
      }
      const currencyExchangeRates = null
      const currency = 'GBR'
      const guests = 3
      const totalNights = Object.keys(nightlyRates).length

      const extras = [
        {
          amount: 20,
          quantity: 1,
          taxIncluded: 0,
          taxValue: 20,
          rateType: 'fixed',
          chargeType: 'perNight',
        },
      ]

      expect(repository.calculateExtras(nightlyRates, currencyExchangeRates, currency, guests, totalNights)(extras))
        .toEqual([
          {
            amount: 20,
            quantity: 1,
            taxIncluded: 0,
            taxValue: 20,
            currency: 'GBR',
            rateType: 'fixed',
            chargeType: 'perNight',
            currencyRate: 1,
            totalAmount: 120,
            totalAmountExchanged: 120,
          },
        ])
    })

    it('should return array of extras with calculations if there is no rates for needed currency', () => {
      const nightlyRates = {
        '2021-02-01': 50,
        '2021-02-02': 50,
        '2021-02-03': 50,
        '2021-02-04': 50,
        '2021-02-05': 50,
      }
      const currencyExchangeRates = {
        rates: {
          usd: 1,
        },
      }
      const currency = 'GBR'
      const guests = 3
      const totalNights = Object.keys(nightlyRates).length

      const extras = [
        {
          amount: 20,
          quantity: 1,
          taxIncluded: 0,
          taxValue: 20,
          currency: 'USD',
          rateType: 'fixed',
          chargeType: 'perNight',
        },
      ]

      expect(repository.calculateExtras(nightlyRates, currencyExchangeRates, currency, guests, totalNights)(extras))
        .toEqual([
          {
            amount: 20,
            quantity: 1,
            taxIncluded: 0,
            taxValue: 20,
            currency: 'GBR',
            rateType: 'fixed',
            chargeType: 'perNight',
            currencyRate: 1,
            totalAmount: 120,
            totalAmountExchanged: 120,
          },
        ])
    })
  })

  describe('sumTotalExtras', () => {
    it('should sum all extras', () => {
      const data = [
        { totalAmountExchanged: 100 },
        { totalAmountExchanged: 200 },
        { totalAmountExchanged: 300 },
      ]

      expect(repository.sumTotalExtras(data)).toBe(600)
    })

    it('should return 0 for non-passed argument', () => {
      expect(repository.sumTotalExtras()).toBe(0)
    })
  })

  describe('selectBy', () => {
    const conditions = { accountId: 1 }
    const trx = 'trx'

    it('should return array of resources', async () => {
      const fees = [
        { id: 1 },
      ]
      const taxes = [
        { id: 1 },
      ]
      const services = [
        { id: 1 },
      ]

      const response = [
        { id: 'fee-1', extrasType: 'fee' },
        { id: 'tax-1', extrasType: 'tax' },
        { id: 'service-1', extrasType: 'service' },
      ]

      selectBookingFeesBy.mockResolvedValue(fees)
      selectBookingTaxesBy.mockResolvedValue(taxes)
      selectBookingServicesBy.mockResolvedValue(services)

      await expect(repository.selectBy(conditions, trx))
        .resolves.toEqual(response)

      expect(selectBookingFeesBy).toBeCalledWith(conditions, trx)
      expect(selectBookingTaxesBy).toBeCalledWith(conditions, trx)
      expect(selectBookingServicesBy).toBeCalledWith(conditions, trx)
    })
  })

  describe('selectOneById', () => {
    const conditions = { accountId: 1 }
    const trx = 'trx'

    it('should return null for not existed type', () => {
      expect(repository.selectOneById('unknown-1', conditions, trx))
        .toBeNull()
    })

    it('should return fee', async () => {
      const data = { name: 'fee 1', id: 1 }

      selectBookingFeeBy.mockResolvedValue(data)

      await expect(repository.selectOneById('fee-1', conditions, trx))
        .resolves.toEqual({
          ...data,
          id: `fee-${data.id}`,
        })

      expect(selectBookingFeeBy).toBeCalledWith({ id: data.id.toString(), ...conditions }, trx)
    })

    it('should return tax', async () => {
      const data = { name: 'tax 1', id: 1 }

      selectBookingTaxBy.mockResolvedValue(data)

      await expect(repository.selectOneById('tax-1', conditions, trx))
        .resolves.toEqual({
          ...data,
          id: `tax-${data.id}`,
        })

      expect(selectBookingTaxBy).toBeCalledWith({ id: data.id.toString(), ...conditions }, trx)
    })

    it('should return service', async () => {
      const data = { name: 'service 1', id: 1 }

      selectBookingServiceBy.mockResolvedValue(data)

      await expect(repository.selectOneById('service-1', conditions, trx))
        .resolves.toEqual({
          ...data,
          id: `service-${data.id}`,
        })

      expect(selectBookingServiceBy).toBeCalledWith({ id: data.id.toString(), ...conditions }, trx)
    })
  })

  describe('create', () => {
    const payload = { name: 'name' }
    const trx = 'trx'

    it('should return null for not existed type', () => {
      expect(repository.create('unknown', payload, trx))
        .toBeNull()
    })

    it('should create fee', async () => {
      const response = { id: 'fee-1', name: 'name' }

      createBookingFee.mockResolvedValue(response)
      onlyKeys.mockReturnValue(response)

      await expect(repository.create('fee', payload, trx))
        .resolves.toEqual(response)

      expect(createBookingFee).toBeCalledWith(response, trx)
      expect(onlyKeys).toBeCalledWith(payload, [
        'bookingId',
        'dictFeeId',
        'name',
        'rateType',
        'percentage',
        'currency',
        'amount',
        'chargeType',
        'frequency',
        'taxIncluded',
        'taxValue',
        'totalAmount',
        'totalAmountExchanged',
        'description',
      ])
    })

    it('should create tax', async () => {
      const response = { id: 'tax-1', name: 'name' }

      createBookingTax.mockResolvedValue(response)
      onlyKeys.mockReturnValue(response)

      await expect(repository.create('tax', payload, trx))
        .resolves.toEqual(response)

      expect(createBookingTax).toBeCalledWith(response, trx)
      expect(onlyKeys).toBeCalledWith(payload, [
        'bookingId',
        'name',
        'rateType',
        'percentage',
        'currency',
        'amount',
        'chargeType',
        'frequency',
        'totalAmount',
        'totalAmountExchanged',
        'description',
      ])
    })

    it('should create service', async () => {
      const response = { id: 'service-1', name: 'name' }

      createBookingService.mockResolvedValue(response)
      onlyKeys.mockReturnValue(response)

      await expect(repository.create('service', payload, trx))
        .resolves.toEqual(response)

      expect(createBookingService).toBeCalledWith(response, trx)
      expect(onlyKeys).toBeCalledWith(payload, [
        'bookingId',
        'propertyServiceId',
        'name',
        'quantity',
        'duration',
        'type',
        'chargeType',
        'currency',
        'amount',
        'totalAmount',
        'totalAmountExchanged',
        'taxIncluded',
        'taxValue',
        'startDate',
        'startTime',
        'reminders',
        'providerName',
        'providerEmail',
        'providerPhoneNumber',
        'providerCompanyName',
        'providerCompanyAddress',
        'providerContactPerson',
        'providerDescription',
        'providerNotes',
        'description',
      ])
    })
  })

  describe('updateById', () => {
    const conditions = { accountId: 1 }
    const payload = { name: 'name' }
    const trx = 'trx'

    it('should return null for not existed type', () => {
      expect(repository.updateById('unknown-1', conditions, payload, trx))
        .toBeNull()
    })

    it('should update fee', async () => {
      updateBookingFeeBy.mockResolvedValue(null)
      onlyKeys.mockReturnValue(payload)

      await expect(repository.updateById('fee-1', conditions, payload, trx))
        .resolves.toBeNull()

      expect(updateBookingFeeBy).toBeCalledWith({ id: '1', ...conditions }, payload, trx)
      expect(onlyKeys).toBeCalledWith(payload, [
        'bookingId',
        'dictFeeId',
        'name',
        'rateType',
        'percentage',
        'currency',
        'amount',
        'chargeType',
        'frequency',
        'taxIncluded',
        'taxValue',
        'totalAmount',
        'totalAmountExchanged',
        'description',
      ])
    })

    it('should update tax', async () => {
      updateBookingTaxBy.mockResolvedValue(null)
      onlyKeys.mockReturnValue(payload)

      await expect(repository.updateById('tax-1', conditions, payload, trx))
        .resolves.toBeNull()

      expect(updateBookingTaxBy).toBeCalledWith({ id: '1', ...conditions }, payload, trx)
      expect(onlyKeys).toBeCalledWith(payload, [
        'bookingId',
        'name',
        'rateType',
        'percentage',
        'currency',
        'amount',
        'chargeType',
        'frequency',
        'totalAmount',
        'totalAmountExchanged',
        'description',
      ])
    })

    it('should update service', async () => {
      updateBookingServiceBy.mockResolvedValue(null)
      onlyKeys.mockReturnValue(payload)

      await expect(repository.updateById('service-1', conditions, payload, trx))
        .resolves.toBeNull()

      expect(updateBookingServiceBy).toBeCalledWith({ id: '1', ...conditions }, payload, trx)
      expect(onlyKeys).toBeCalledWith(payload, [
        'bookingId',
        'propertyServiceId',
        'name',
        'quantity',
        'duration',
        'type',
        'chargeType',
        'currency',
        'amount',
        'totalAmount',
        'totalAmountExchanged',
        'taxIncluded',
        'taxValue',
        'startDate',
        'startTime',
        'reminders',
        'providerName',
        'providerEmail',
        'providerPhoneNumber',
        'providerCompanyName',
        'providerCompanyAddress',
        'providerContactPerson',
        'providerDescription',
        'providerNotes',
        'description',
      ])
    })
  })

  describe('deleteById', () => {
    const conditions = { accountId: 1 }
    const trx = 'trx'

    it('should return null for not existed type', () => {
      expect(repository.deleteById('unknown-1', conditions, trx))
        .toBeNull()
    })

    it('should delete fee', async () => {
      deleteBookingFeeBy.mockResolvedValue(null)

      await expect(repository.deleteById('fee-1', conditions, trx))
        .resolves.toBeNull()

      expect(deleteBookingFeeBy).toBeCalledWith({ id: '1', ...conditions }, trx)
    })

    it('should delete tax', async () => {
      deleteBookingTaxBy.mockResolvedValue(null)

      await expect(repository.deleteById('tax-1', conditions, trx))
        .resolves.toBeNull()

      expect(deleteBookingTaxBy).toBeCalledWith({ id: '1', ...conditions }, trx)
    })

    it('should delete service', async () => {
      deleteBookingServiceBy.mockResolvedValue(null)

      await expect(repository.deleteById('service-1', conditions, trx))
        .resolves.toBeNull()

      expect(deleteBookingServiceBy).toBeCalledWith({ id: '1', ...conditions }, trx)
    })
  })
})
