const {
  insert, remove, select, selectOne,
} = require('../../../services/database')
const dao = require('../../../services/dao')

jest.mock('../../../services/dao')
jest.mock('../../../services/database')

const repository = require('./repositories')

describe('unit-type-rate-prices repositories', () => {
  const tableName = 'property_unit_type_rate_prices'
  const accountId = 'accountId'
  const propertyUnitTypeId = 'propertyUnitTypeId'
  const totalGuests = 1
  const trx = 'trx'
  const unitTypeRate = { id: 'id' }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('dao', () => {
    it('should initialize a DAO', async () => {
      const model = {
        tableName,
        methods: {
          changeAccomodationSize: expect.any(Function),
          withUnitTypeRates: expect.any(Function),
        },
      }
      expect(repository).toEqual(model)
      expect(dao).toBeCalledWith(model)
    })
  })

  describe('changeAccomodationSize', () => {
    it('should call changeAccomodationSize method and remove rate prices', async () => {
      const unitTypeRatePrices = [
        { id: 1, name: 'name' },
        { id: 2, name: 'name2' },
        { id: 3, name: 'name3' },
      ]

      selectOne.mockResolvedValue(unitTypeRate)
      select.mockResolvedValue(unitTypeRatePrices)
      remove.mockResolvedValue()

      await expect(repository.methods.changeAccomodationSize({ accountId, propertyUnitTypeId }, totalGuests, trx))
        .resolves.toEqual([undefined, undefined])

      expect(selectOne).toBeCalledWith('property_unit_type_rates', { accountId, propertyUnitTypeId }, trx)
      expect(select).toBeCalledWith('property_unit_type_rate_prices', {
        accountId, propertyUnitTypeRateId: unitTypeRate.id,
      }, trx)
      expect(remove).toBeCalledWith('property_unit_type_rate_prices', { id: 3 }, trx)
    })

    it('should call changeAccomodationSize method and insert rate prices', async () => {
      const unitTypeRatePrices = [{ id: 1, name: 'name' }]

      selectOne.mockResolvedValue(unitTypeRate)
      select.mockResolvedValue(unitTypeRatePrices)
      insert.mockResolvedValue()

      await expect(repository.methods.changeAccomodationSize({ accountId, propertyUnitTypeId }, 2, trx))
        .resolves.toEqual([undefined])

      expect(selectOne).toBeCalledWith('property_unit_type_rates', { accountId, propertyUnitTypeId }, trx)
      expect(select).toBeCalledWith('property_unit_type_rate_prices', {
        accountId, propertyUnitTypeRateId: unitTypeRate.id,
      }, trx)
      expect(insert).toBeCalledWith('property_unit_type_rate_prices', {
        accountId,
        propertyUnitTypeRateId: unitTypeRate.id,
        occupancy: 2,
        enabled: 1,
      }, trx)
    })
  })
})
