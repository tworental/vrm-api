const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('unit-type-rate-seasons repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'property_unit_type_rate_seasons',
      methods: {
        isCompleted: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  describe('isCompleted', () => {
    it('should return false if name = null', () => {
      const data = { name: null }

      expect(repository.methods.isCompleted(data))
        .toBeFalsy()
    })

    it('should return false if startDate = null', () => {
      const data = {
        name: 'name',
        startDate: null,
      }

      expect(repository.methods.isCompleted(data))
        .toBeFalsy()
    })

    it('should return false if endDate = null', () => {
      const data = {
        name: 'name',
        startDate: new Date(),
        endDate: null,
      }

      expect(repository.methods.isCompleted(data))
        .toBeFalsy()
    })

    it('should return false if accomodations = null', () => {
      const data = {
        name: 'name',
        startDate: new Date(),
        endDate: new Date(),
        accomodations: null,
      }

      expect(repository.methods.isCompleted(data))
        .toBeFalsy()
    })

    it('should return false if minStayDays = 0', () => {
      const data = {
        name: 'name',
        startDate: new Date(),
        endDate: new Date(),
        accomodations: [],
        minStayDays: 0,
      }

      expect(repository.methods.isCompleted(data))
        .toBeFalsy()
    })

    describe('minStayWeekdayEnabled = true', () => {
      it('should return false if minStayWeekdayMo = 0', () => {
        const data = {
          name: 'name',
          startDate: new Date(),
          endDate: new Date(),
          accomodations: [],
          minStayDays: 1,
          minStayWeekdayEnabled: 1,
          minStayWeekdayMo: 0,
        }

        expect(repository.methods.isCompleted(data))
          .toBeFalsy()
      })

      it('should return false if minStayWeekdayTu = 0', () => {
        const data = {
          name: 'name',
          startDate: new Date(),
          endDate: new Date(),
          accomodations: [],
          minStayDays: 1,
          minStayWeekdayEnabled: 1,
          minStayWeekdayMo: 1,
          minStayWeekdayTu: 0,
        }

        expect(repository.methods.isCompleted(data))
          .toBeFalsy()
      })

      it('should return false if minStayWeekdayWe = 0', () => {
        const data = {
          name: 'name',
          startDate: new Date(),
          endDate: new Date(),
          accomodations: [],
          minStayDays: 1,
          minStayWeekdayEnabled: 1,
          minStayWeekdayMo: 1,
          minStayWeekdayTu: 1,
          minStayWeekdayWe: 0,
        }

        expect(repository.methods.isCompleted(data))
          .toBeFalsy()
      })

      it('should return false if minStayWeekdayTh = 0', () => {
        const data = {
          name: 'name',
          startDate: new Date(),
          endDate: new Date(),
          accomodations: [],
          minStayDays: 1,
          minStayWeekdayEnabled: 1,
          minStayWeekdayMo: 1,
          minStayWeekdayTu: 1,
          minStayWeekdayWe: 1,
          minStayWeekdayTh: 0,
        }

        expect(repository.methods.isCompleted(data))
          .toBeFalsy()
      })

      it('should return false if minStayWeekdayFr = 0', () => {
        const data = {
          name: 'name',
          startDate: new Date(),
          endDate: new Date(),
          accomodations: [],
          minStayDays: 1,
          minStayWeekdayEnabled: 1,
          minStayWeekdayMo: 1,
          minStayWeekdayTu: 1,
          minStayWeekdayWe: 1,
          minStayWeekdayTh: 1,
          minStayWeekdayFr: 0,
        }

        expect(repository.methods.isCompleted(data))
          .toBeFalsy()
      })

      it('should return false if minStayWeekdaySa = 0', () => {
        const data = {
          name: 'name',
          startDate: new Date(),
          endDate: new Date(),
          accomodations: [],
          minStayDays: 1,
          minStayWeekdayEnabled: 1,
          minStayWeekdayMo: 1,
          minStayWeekdayTu: 1,
          minStayWeekdayWe: 1,
          minStayWeekdayTh: 1,
          minStayWeekdayFr: 1,
          minStayWeekdaySa: 0,
        }

        expect(repository.methods.isCompleted(data))
          .toBeFalsy()
      })

      it('should return false if minStayWeekdaySu = 0', () => {
        const data = {
          name: 'name',
          startDate: new Date(),
          endDate: new Date(),
          accomodations: [],
          minStayDays: 1,
          minStayWeekdayEnabled: 1,
          minStayWeekdayMo: 1,
          minStayWeekdayTu: 1,
          minStayWeekdayWe: 1,
          minStayWeekdayTh: 1,
          minStayWeekdayFr: 1,
          minStayWeekdaySa: 1,
          minStayWeekdaySu: 0,
        }

        expect(repository.methods.isCompleted(data))
          .toBeFalsy()
      })

      it('should return true', () => {
        const data = {
          name: 'name',
          startDate: new Date(),
          endDate: new Date(),
          accomodations: [],
          minStayDays: 1,
          minStayWeekdayEnabled: 1,
          minStayWeekdayMo: 1,
          minStayWeekdayTu: 1,
          minStayWeekdayWe: 1,
          minStayWeekdayTh: 1,
          minStayWeekdayFr: 1,
          minStayWeekdaySa: 1,
          minStayWeekdaySu: 1,
        }

        expect(repository.methods.isCompleted(data))
          .toBeTruthy()
      })
    })

    it('should return false if accommodation item is not completed', () => {
      const data = {
        name: 'name',
        startDate: new Date(),
        endDate: new Date(),
        priceWeekdayEnabled: 1,
        accomodations: [
          {
            enabled: 1,
            priceNightly: 0,
            priceWeekdayMo: 1,
            priceWeekdayTu: 1,
            priceWeekdayWe: 1,
            priceWeekdayTh: 1,
            priceWeekdayFr: 1,
            priceWeekdaySa: 1,
            priceWeekdaySu: 1,
          },
          {
            enabled: 1,
            priceNightly: 1,
            priceWeekdayMo: 1,
            priceWeekdayTu: 1,
            priceWeekdayWe: 1,
            priceWeekdayTh: 1,
            priceWeekdayFr: 1,
            priceWeekdaySa: 1,
            priceWeekdaySu: 1,
          },
          {
            enabled: 1,
            priceNightly: 1,
            priceWeekdayMo: 1,
            priceWeekdayTu: 1,
            priceWeekdayWe: 1,
            priceWeekdayTh: 1,
            priceWeekdayFr: 1,
            priceWeekdaySa: 1,
            priceWeekdaySu: 0,
          },
          {
            enabled: 1,
            priceNightly: 1,
            priceWeekdayMo: 1,
            priceWeekdayTu: 1,
            priceWeekdayWe: 1,
            priceWeekdayTh: 1,
            priceWeekdayFr: 1,
            priceWeekdaySa: 0,
            priceWeekdaySu: 0,
          },
          {
            enabled: 1,
            priceNightly: 1,
            priceWeekdayMo: 1,
            priceWeekdayTu: 1,
            priceWeekdayWe: 1,
            priceWeekdayTh: 1,
            priceWeekdayFr: 0,
            priceWeekdaySa: 0,
            priceWeekdaySu: 0,
          },
          {
            enabled: 1,
            priceNightly: 1,
            priceWeekdayMo: 1,
            priceWeekdayTu: 1,
            priceWeekdayWe: 1,
            priceWeekdayTh: 0,
            priceWeekdayFr: 0,
            priceWeekdaySa: 0,
            priceWeekdaySu: 0,
          },
          {
            enabled: 1,
            priceNightly: 1,
            priceWeekdayMo: 1,
            priceWeekdayTu: 1,
            priceWeekdayWe: 0,
            priceWeekdayTh: 0,
            priceWeekdayFr: 0,
            priceWeekdaySa: 0,
            priceWeekdaySu: 0,
          },
          {
            enabled: 1,
            priceNightly: 1,
            priceWeekdayMo: 1,
            priceWeekdayTu: 0,
            priceWeekdayWe: 0,
            priceWeekdayTh: 0,
            priceWeekdayFr: 0,
            priceWeekdaySa: 0,
            priceWeekdaySu: 0,
          },
          {
            enabled: 1,
            priceNightly: 1,
            priceWeekdayMo: 0,
            priceWeekdayTu: 0,
            priceWeekdayWe: 0,
            priceWeekdayTh: 0,
            priceWeekdayFr: 0,
            priceWeekdaySa: 0,
            priceWeekdaySu: 0,
          },
          {
            enabled: 0,
          },
        ],
        minStayDays: 1,
        minStayWeekdayEnabled: 0,
      }

      expect(repository.methods.isCompleted(data))
        .toBeFalsy()
    })

    it('should return true', () => {
      const data = {
        name: 'name',
        startDate: new Date(),
        endDate: new Date(),
        priceWeekdayEnabled: 0,
        accomodations: [
          {
            enabled: 1,
            priceNightly: 1,
            priceWeekdayMo: 1,
            priceWeekdayTu: 1,
            priceWeekdayWe: 1,
            priceWeekdayTh: 1,
            priceWeekdayFr: 1,
            priceWeekdaySa: 1,
            priceWeekdaySu: 1,
          },
        ],
        minStayDays: 1,
        minStayWeekdayEnabled: 0,
      }

      expect(repository.methods.isCompleted(data))
        .toBeTruthy()
    })
  })
})
