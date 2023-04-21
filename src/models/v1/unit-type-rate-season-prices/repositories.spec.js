const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('unit-type-rate-season-prices repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'property_unit_type_rate_season_prices',
      methods: {
        changeAccomodationSize: expect.any(Function),
        withUnitTypeRateSeasons: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
