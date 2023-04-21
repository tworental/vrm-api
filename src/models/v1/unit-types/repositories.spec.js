const { select, selectOne } = require('../../../services/database')
const dao = require('../../../services/dao')

jest.mock('../../../services/database')
jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('unit-types repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'property_unit_types',
      softDelete: true,
      methods: {
        completenessDetails: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  describe('completenessDetails', () => {
    it('should return completeness details with not completed overview', async () => {
      const unitType = {
        id: 1,
        propertyId: 1,
        name: 'unitType',
        area: 12,
        totalGuests: 0,
      }
      const multipleUnitTypes = 1
      const trx = 'trx'

      const whereNull = jest.fn().mockResolvedValue(1)
      selectOne.mockReturnValueOnce({ whereNull })

      const join = jest.fn().mockResolvedValue([])
      const selectFn = jest.fn().mockReturnValue({ join })
      select.mockReturnValueOnce({ select: selectFn })

      const whereNotNull = jest.fn().mockResolvedValue(1)
      selectOne.mockReturnValueOnce({ whereNotNull })

      await expect(repository.methods.completenessDetails(unitType, multipleUnitTypes, trx))
        .resolves.toEqual({
          overview: false,
          photos: true,
          rates: true,
          units: true,
        })

      expect(selectOne).toBeCalledWith('property_images', { propertyId: 1, propertyUnitTypeId: 1 }, trx)
      expect(whereNull).toBeCalledWith('propertyUnitTypeUnitId')
      expect(select).toBeCalledWith('property_unit_type_rate_prices', { propertyUnitTypeId: 1, enabled: 1 }, trx)
      expect(selectFn).toBeCalledWith('priceWeekdayEnabled')
      expect(join).toBeCalledWith(
        'property_unit_type_rates',
        'property_unit_type_rates.id',
        'property_unit_type_rate_prices.property_unit_type_rate_id',
      )
      expect(whereNotNull).toBeCalledWith('area')
      expect(selectOne).toBeCalledWith('property_unit_type_units', {
        propertyId: 1, propertyUnitTypeId: 1, isCompleted: 1,
      }, trx)
    })

    it('should return completeness details with not completed photos', async () => {
      const unitType = {
        id: 1,
        propertyId: 1,
        name: 'unitType',
        area: 12,
        totalGuests: 2,
      }
      const multipleUnitTypes = 1
      const trx = 'trx'

      const whereNull = jest.fn().mockResolvedValue(0)
      selectOne.mockReturnValueOnce({ whereNull })

      const join = jest.fn().mockResolvedValue([])
      const selectFn = jest.fn().mockReturnValue({ join })
      select.mockReturnValueOnce({ select: selectFn })

      const whereNotNull = jest.fn().mockResolvedValue(1)
      selectOne.mockReturnValueOnce({ whereNotNull })

      await expect(repository.methods.completenessDetails(unitType, multipleUnitTypes, trx))
        .resolves.toEqual({
          overview: true,
          photos: false,
          rates: true,
          units: true,
        })

      expect(selectOne).toBeCalledWith('property_images', { propertyId: 1, propertyUnitTypeId: 1 }, trx)
      expect(whereNull).toBeCalledWith('propertyUnitTypeUnitId')
      expect(select).toBeCalledWith('property_unit_type_rate_prices', { propertyUnitTypeId: 1, enabled: 1 }, trx)
      expect(selectFn).toBeCalledWith('priceWeekdayEnabled')
      expect(join).toBeCalledWith(
        'property_unit_type_rates',
        'property_unit_type_rates.id',
        'property_unit_type_rate_prices.property_unit_type_rate_id',
      )
      expect(whereNotNull).toBeCalledWith('area')
      expect(selectOne).toBeCalledWith('property_unit_type_units', {
        propertyId: 1, propertyUnitTypeId: 1, isCompleted: 1,
      }, trx)
    })

    it('should return completeness details with not completed rates for enabled price weekday', async () => {
      const unitType = {
        id: 1,
        propertyId: 1,
        name: 'unitType',
        area: 12,
        totalGuests: 2,
      }
      const multipleUnitTypes = 1
      const trx = 'trx'

      const whereNull = jest.fn().mockResolvedValue(1)
      selectOne.mockReturnValueOnce({ whereNull })

      const join = jest.fn().mockResolvedValue([
        {
          priceWeekdayEnabled: 1,
          priceWeekdayMo: 1,
          priceWeekdayTu: 1,
          priceWeekdayWe: 1,
          priceWeekdayTh: 1,
          priceWeekdayFr: 1,
          priceWeekdaySa: 1,
          priceWeekdaySu: null,
        },
      ])
      const selectFn = jest.fn().mockReturnValue({ join })
      select.mockReturnValueOnce({ select: selectFn })

      const whereNotNull = jest.fn().mockResolvedValue(1)
      selectOne.mockReturnValueOnce({ whereNotNull })

      await expect(repository.methods.completenessDetails(unitType, multipleUnitTypes, trx))
        .resolves.toEqual({
          overview: true,
          photos: true,
          rates: false,
          units: true,
        })

      expect(selectOne).toBeCalledWith('property_images', { propertyId: 1, propertyUnitTypeId: 1 }, trx)
      expect(whereNull).toBeCalledWith('propertyUnitTypeUnitId')
      expect(select).toBeCalledWith('property_unit_type_rate_prices', { propertyUnitTypeId: 1, enabled: 1 }, trx)
      expect(selectFn).toBeCalledWith('priceWeekdayEnabled')
      expect(join).toBeCalledWith(
        'property_unit_type_rates',
        'property_unit_type_rates.id',
        'property_unit_type_rate_prices.property_unit_type_rate_id',
      )
      expect(whereNotNull).toBeCalledWith('area')
      expect(selectOne).toBeCalledWith('property_unit_type_units', {
        propertyId: 1, propertyUnitTypeId: 1, isCompleted: 1,
      }, trx)
    })

    it('should return completeness details with not completed rates for disabled price weekday', async () => {
      const unitType = {
        id: 1,
        propertyId: 1,
        name: 'unitType',
        area: 12,
        totalGuests: 2,
      }
      const multipleUnitTypes = 0
      const trx = 'trx'

      const join = jest.fn().mockResolvedValue([
        {
          priceWeekdayEnabled: 0,
          priceNightly: null,
        },
      ])
      const selectFn = jest.fn().mockReturnValue({ join })
      select.mockReturnValueOnce({ select: selectFn })

      const whereNotNull = jest.fn().mockResolvedValue(1)
      selectOne.mockReturnValueOnce({ whereNotNull })

      await expect(repository.methods.completenessDetails(unitType, multipleUnitTypes, trx))
        .resolves.toEqual({
          overview: true,
          rates: false,
          units: true,
        })

      expect(select).toBeCalledWith('property_unit_type_rate_prices', { propertyUnitTypeId: 1, enabled: 1 }, trx)
      expect(selectFn).toBeCalledWith('priceWeekdayEnabled')
      expect(join).toBeCalledWith(
        'property_unit_type_rates',
        'property_unit_type_rates.id',
        'property_unit_type_rate_prices.property_unit_type_rate_id',
      )
      expect(whereNotNull).toBeCalledWith('area')
      expect(selectOne).toBeCalledWith('property_unit_type_units', {
        propertyId: 1, propertyUnitTypeId: 1, isCompleted: 1,
      }, trx)
    })

    it('should return completeness details with not completed units for enabled price weekday', async () => {
      const unitType = {
        id: 1,
        propertyId: 1,
        name: 'unitType',
        area: 12,
        totalGuests: 2,
      }
      const multipleUnitTypes = 1
      const trx = 'trx'

      const whereNull = jest.fn().mockResolvedValue(1)
      selectOne.mockReturnValueOnce({ whereNull })

      const join = jest.fn().mockResolvedValue([])
      const selectFn = jest.fn().mockReturnValue({ join })
      select.mockReturnValueOnce({ select: selectFn })

      const whereNotNull = jest.fn().mockResolvedValue(0)
      selectOne.mockReturnValueOnce({ whereNotNull })

      await expect(repository.methods.completenessDetails(unitType, multipleUnitTypes, trx))
        .resolves.toEqual({
          overview: true,
          photos: true,
          rates: true,
          units: false,
        })

      expect(selectOne).toBeCalledWith('property_images', { propertyId: 1, propertyUnitTypeId: 1 }, trx)
      expect(whereNull).toBeCalledWith('propertyUnitTypeUnitId')
      expect(select).toBeCalledWith('property_unit_type_rate_prices', { propertyUnitTypeId: 1, enabled: 1 }, trx)
      expect(selectFn).toBeCalledWith('priceWeekdayEnabled')
      expect(join).toBeCalledWith(
        'property_unit_type_rates',
        'property_unit_type_rates.id',
        'property_unit_type_rate_prices.property_unit_type_rate_id',
      )
      expect(whereNotNull).toBeCalledWith('area')
      expect(selectOne).toBeCalledWith('property_unit_type_units', {
        propertyId: 1, propertyUnitTypeId: 1, isCompleted: 1,
      }, trx)
    })

    it('should return false-objects', async () => {
      const unitType = null
      const multipleUnitTypes = 1
      const trx = 'trx'

      await expect(repository.methods.completenessDetails(unitType, multipleUnitTypes, trx))
        .resolves.toEqual({
          overview: false,
          rates: false,
          units: false,
        })
    })
  })
})
