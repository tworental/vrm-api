const service = require('./number')

describe('number service', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('sumArray', () => {
    it('should sum array of numbers', () => {
      const data = [0, 1, 2, 3, 4, 5, 6]
      const sum = 21

      expect(service.sumArray(data)).toBe(sum)
    })

    it('should sum array of objects with number keys', () => {
      const data = [{ amount: 1 }, { amount: 2 }, { amount: 3 }]
      const sum = 6

      expect(service.sumArray(data, 'amount')).toBe(sum)
    })
  })

  describe('avgArray', () => {
    it('should get average value from array of numbers', () => {
      const data = [10, 20, 30, 40]
      const avg = 25

      expect(service.avgArray(data)).toBe(avg)
    })

    it('should get average value from array of objects with number keys', () => {
      const data = [{ amount: 10 }, { amount: 20 }, { amount: 30 }, { amount: 40 }]
      const avg = 25

      expect(service.avgArray(data, 'amount')).toBe(avg)
    })
  })
})
