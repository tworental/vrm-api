const config = require('config')
const dao = require('../../../services/dao')

jest.mock('config')
jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('accounts repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'accounts',
      methods: {
        trialExpirationDate: expect.any(Function),
      },
    }
    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  describe('trialExpirationDate', () => {
    it('should return null if trialPeriod is not NaN', () => {
      config.get.mockImplementation(() => NaN)

      expect(repository.methods.trialExpirationDate()).toBeNull()
    })

    it('should return date which expires in expectedPeriod', () => {
      const now = 10000000

      jest.spyOn(Date, 'now').mockReturnValue(now)

      const expectedPeriod = 5 * 24 * 60 * 60 * 1000

      config.get.mockImplementation(() => 5)

      const receivedDate = repository.methods.trialExpirationDate()

      expect(receivedDate.getTime() - now).toBe(expectedPeriod)
    })
  })
})
