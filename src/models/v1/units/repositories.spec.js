const { raw, select } = require('../../../services/database')
const dao = require('../../../services/dao')

jest.mock('../../../services/database')
jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('units repositories', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'property_unit_type_units',
      softDelete: true,
      methods: {
        selectWithPropertiesBy: expect.any(Function),
        withProperty: expect.any(Function),
        withUnitType: expect.any(Function),
        completenessDetails: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  describe('selectWithPropertiesBy', () => {
    it('should mutate query builder', () => {
      const conditions = 'conditions'
      const trx = 'trx'

      const selectFn = jest.fn()
      const join = jest.fn().mockReturnValue({ select: selectFn })
      select.mockReturnValueOnce({ join })
      raw.mockReturnValueOnce('properties.name AS propertyName')

      repository.methods.selectWithPropertiesBy(conditions, trx)

      expect(select).toBeCalledWith('property_unit_type_units', conditions, trx)
      expect(join).toBeCalledWith('properties', 'properties.id', 'property_unit_type_units.property_id')
      expect(raw).toBeCalledWith('properties.name AS propertyName')
      expect(selectFn).toBeCalledWith([
        'property_unit_type_units.*',
        'properties.account_id',
        'properties.name AS propertyName',
      ])
    })
  })

  describe('withProperty ', () => {
    it('should mutate query builder', () => {
      const selectFn = jest.fn()
      const join = jest.fn().mockReturnValue({ select: selectFn })

      const queryBuilder = { join }

      raw.mockReturnValueOnce('properties.name AS property_name')

      repository.methods.withProperty(queryBuilder)

      expect(join).toBeCalledWith('properties', 'properties.id', 'property_unit_type_units.property_id')
      expect(raw).toBeCalledWith('properties.name AS property_name')
      expect(selectFn).toBeCalledWith([
        'properties.account_id',
        'properties.multiple_unit_types',
        'properties.name AS property_name',
      ])
    })
  })

  describe('withUnitType ', () => {
    it('should mutate query builder', () => {
      const selectFn = jest.fn()
      const join = jest.fn().mockReturnValue({ select: selectFn })

      const queryBuilder = { join }

      raw.mockReturnValueOnce('property_unit_types.is_completed AS property_unit_type_completed')
      raw.mockReturnValueOnce('property_unit_types.name AS property_unit_type_name')

      repository.methods.withUnitType(queryBuilder)

      expect(join).toBeCalledWith(
        'property_unit_types', 'property_unit_types.id',
        'property_unit_type_units.property_unit_type_id',
      )
      expect(raw).toBeCalledWith('property_unit_types.is_completed AS property_unit_type_completed')
      expect(raw).toBeCalledWith('property_unit_types.name AS property_unit_type_name')
      expect(selectFn).toBeCalledWith([
        'property_unit_types.is_completed AS property_unit_type_completed',
        'property_unit_types.name AS property_unit_type_name',
      ])
    })
  })

  describe('completenessDetails ', () => {
    it('should return overview object with false for nullable unit', async () => {
      const unit = null

      await expect(repository.methods.completenessDetails(unit))
        .resolves.toEqual({ overview: false })
    })

    it('should return overview object with true for unit', async () => {
      const unit = { name: 'unit', area: 2 }

      await expect(repository.methods.completenessDetails(unit))
        .resolves.toEqual({ overview: true })
    })

    it('should return overview object with false for unit without name and area', async () => {
      const unit = { name: null, area: null }

      await expect(repository.methods.completenessDetails(unit))
        .resolves.toEqual({ overview: false })
    })
  })
})
