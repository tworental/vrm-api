const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('rate-seasons repositories', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'rate_seasons',
      methods: {
        rateAttrs: expect.any(Function),
        ratePriceAttrs: expect.any(Function),
        isCompleted: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  describe('rateAttrs', () => {
    it('should return an object which contains followed attributes', () => {
      const data = {
        id: 1,
        extraField: null,
        priceWeekdayEnabled: null,
        discountEnabled: null,
        discountType: null,
        discountWeekly: null,
        discountMonthly: null,
        discountCustomEnabled: null,
        discountCustom: null,
        discountCustomPeriod: null,
        minStayDays: null,
        minStayWeekdayEnabled: null,
        minStayWeekdayMo: null,
        minStayWeekdayTu: null,
        minStayWeekdayWe: null,
        minStayWeekdayTh: null,
        minStayWeekdayFr: null,
        minStayWeekdaySa: null,
        minStayWeekdaySu: null,
        occupancyEnabled: null,
        occupancyStartsAfterPerson: null,
        occupancyExtraCharge: null,
        shortStayEnabled: null,
        shortStayDays: null,
        shortStayExtraCharge: null,
        selfServiceRestrictionsEnabled: null,
        selfServiceCheckinMo: null,
        selfServiceCheckinTu: null,
        selfServiceCheckinWe: null,
        selfServiceCheckinTh: null,
        selfServiceCheckinFr: null,
        selfServiceCheckinSa: null,
        selfServiceCheckinSu: null,
        selfServiceCheckoutMo: null,
        selfServiceCheckoutTu: null,
        selfServiceCheckoutWe: null,
        selfServiceCheckoutTh: null,
        selfServiceCheckoutFr: null,
        selfServiceCheckoutSa: null,
        selfServiceCheckoutSu: null,
        notesEnabled: null,
        notes: null,
      }
      const response = {
        priceWeekdayEnabled: null,
        discountEnabled: null,
        discountType: null,
        discountWeekly: null,
        discountMonthly: null,
        discountCustomEnabled: null,
        discountCustom: null,
        discountCustomPeriod: null,
        minStayDays: null,
        minStayWeekdayEnabled: null,
        minStayWeekdayMo: null,
        minStayWeekdayTu: null,
        minStayWeekdayWe: null,
        minStayWeekdayTh: null,
        minStayWeekdayFr: null,
        minStayWeekdaySa: null,
        minStayWeekdaySu: null,
        occupancyEnabled: null,
        occupancyStartsAfterPerson: null,
        occupancyExtraCharge: null,
        shortStayEnabled: null,
        shortStayDays: null,
        shortStayExtraCharge: null,
        selfServiceRestrictionsEnabled: null,
        selfServiceCheckinMo: null,
        selfServiceCheckinTu: null,
        selfServiceCheckinWe: null,
        selfServiceCheckinTh: null,
        selfServiceCheckinFr: null,
        selfServiceCheckinSa: null,
        selfServiceCheckinSu: null,
        selfServiceCheckoutMo: null,
        selfServiceCheckoutTu: null,
        selfServiceCheckoutWe: null,
        selfServiceCheckoutTh: null,
        selfServiceCheckoutFr: null,
        selfServiceCheckoutSa: null,
        selfServiceCheckoutSu: null,
        notesEnabled: null,
        notes: null,
      }

      expect(repository.methods.rateAttrs(data))
        .toEqual(response)
    })
  })

  describe('ratePriceAttrs', () => {
    it('should return an object which contains followed attributes', () => {
      const data = {
        id: 1,
        extraField: null,
        priceNightly: null,
        priceWeekdayMo: null,
        priceWeekdayTu: null,
        priceWeekdayWe: null,
        priceWeekdayTh: null,
        priceWeekdayFr: null,
        priceWeekdaySa: null,
        priceWeekdaySu: null,
      }
      const response = {
        priceNightly: null,
        priceWeekdayMo: null,
        priceWeekdayTu: null,
        priceWeekdayWe: null,
        priceWeekdayTh: null,
        priceWeekdayFr: null,
        priceWeekdaySa: null,
        priceWeekdaySu: null,
      }

      expect(repository.methods.ratePriceAttrs(data))
        .toEqual(response)
    })
  })

  describe('isComplected', () => {
    it('should return false if name does not exist', () => {
      const data = { name: null }

      expect(repository.methods.isCompleted(data)).toBeFalsy()
    })

    it('should return false if currency does not exist', () => {
      const data = { name: 'data', currency: null }

      expect(repository.methods.isCompleted(data)).toBeFalsy()
    })

    it('should return false if priceNightly less than or equal 0', () => {
      const data = {
        name: 'data',
        currency: 'EUR',
        priceNightly: 0,
      }

      expect(repository.methods.isCompleted(data)).toBeFalsy()
    })

    describe('priceWeekdayEnabled = true', () => {
      it('should return false if priceWeekdayMo less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          priceWeekdayEnabled: true,
          priceWeekdayMo: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if priceWeekdayTu less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          priceWeekdayEnabled: true,
          priceWeekdayMo: 10,
          priceWeekdayTu: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if priceWeekdayWe less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          priceWeekdayEnabled: true,
          priceWeekdayMo: 10,
          priceWeekdayTu: 10,
          priceWeekdayWe: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if priceWeekdayTh less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          priceWeekdayEnabled: true,
          priceWeekdayMo: 10,
          priceWeekdayTu: 10,
          priceWeekdayWe: 10,
          priceWeekdayTh: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if priceWeekdayFr less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          priceWeekdayEnabled: true,
          priceWeekdayMo: 10,
          priceWeekdayTu: 10,
          priceWeekdayWe: 10,
          priceWeekdayTh: 10,
          priceWeekdayFr: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if priceWeekdaySa less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          priceWeekdayEnabled: true,
          priceWeekdayMo: 10,
          priceWeekdayTu: 10,
          priceWeekdayWe: 10,
          priceWeekdayTh: 10,
          priceWeekdayFr: 10,
          priceWeekdaySa: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if priceWeekdaySu less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          priceWeekdayEnabled: true,
          priceWeekdayMo: 10,
          priceWeekdayTu: 10,
          priceWeekdayWe: 10,
          priceWeekdayTh: 10,
          priceWeekdayFr: 10,
          priceWeekdaySa: 10,
          priceWeekdaySu: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if minStayDays less than 1', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          priceWeekdayEnabled: true,
          priceWeekdayMo: 10,
          priceWeekdayTu: 10,
          priceWeekdayWe: 10,
          priceWeekdayTh: 10,
          priceWeekdayFr: 10,
          priceWeekdaySa: 10,
          priceWeekdaySu: 10,
          minStayDays: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })
    })

    it('should return false if minStayDays less than 1', () => {
      const data = {
        name: 'data',
        currency: 'EUR',
        priceNightly: 100,
        priceWeekdayEnabled: false,
        minStayDays: 0,
      }

      expect(repository.methods.isCompleted(data)).toBeFalsy()
    })

    describe('minStayWeekdayEnabled = true', () => {
      it('should return false if minStayWeekdayMo less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          minStayWeekdayEnabled: true,
          minStayWeekdayMo: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if minStayWeekdayTu less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          minStayWeekdayEnabled: true,
          minStayWeekdayMo: 10,
          minStayWeekdayTu: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if minStayWeekdayWe less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          minStayWeekdayEnabled: true,
          minStayWeekdayMo: 10,
          minStayWeekdayTu: 10,
          minStayWeekdayWe: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if minStayWeekdayTh less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          minStayWeekdayEnabled: true,
          minStayWeekdayMo: 10,
          minStayWeekdayTu: 10,
          minStayWeekdayWe: 10,
          minStayWeekdayTh: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if minStayWeekdayFr less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          minStayWeekdayEnabled: true,
          minStayWeekdayMo: 10,
          minStayWeekdayTu: 10,
          minStayWeekdayWe: 10,
          minStayWeekdayTh: 10,
          minStayWeekdayFr: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if minStayWeekdaySa less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          minStayWeekdayEnabled: true,
          minStayWeekdayMo: 10,
          minStayWeekdayTu: 10,
          minStayWeekdayWe: 10,
          minStayWeekdayTh: 10,
          minStayWeekdayFr: 10,
          minStayWeekdaySa: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return false if minStayWeekdaySu less than or equal 0', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          minStayWeekdayEnabled: true,
          minStayWeekdayMo: 10,
          minStayWeekdayTu: 10,
          minStayWeekdayWe: 10,
          minStayWeekdayTh: 10,
          minStayWeekdayFr: 10,
          minStayWeekdaySa: 10,
          minStayWeekdaySu: 0,
        }

        expect(repository.methods.isCompleted(data)).toBeFalsy()
      })

      it('should return true', () => {
        const data = {
          name: 'data',
          currency: 'EUR',
          priceNightly: 100,
          minStayWeekdayEnabled: true,
          minStayWeekdayMo: 10,
          minStayWeekdayTu: 10,
          minStayWeekdayWe: 10,
          minStayWeekdayTh: 10,
          minStayWeekdayFr: 10,
          minStayWeekdaySa: 10,
          minStayWeekdaySu: 10,
          minStayDays: 10,
        }

        expect(repository.methods.isCompleted(data)).toBeTruthy()
      })
    })

    it('should return true', () => {
      const data = {
        name: 'data',
        currency: 'EUR',
        priceNightly: 100,
        minStayDays: 10,
      }

      expect(repository.methods.isCompleted(data)).toBeTruthy()
    })
  })
})
