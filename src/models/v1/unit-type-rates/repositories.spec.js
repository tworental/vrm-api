const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('unit-type-rates repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'property_unit_type_rates',
      methods: {
        getRateByDates: expect.any(Function),
        calculateTotalTax: expect.any(Function),
        isSelfServiceAllowed: expect.any(Function),
        isMinStayDaysAllowed: expect.any(Function),
        calculateNightlyRates: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
