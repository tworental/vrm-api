const {
  select, insert, update, remove,
} = require('../../../services/database')
const { selectBy: selectDictArrangements } = require('../dict-arrangements/repositories')

jest.mock('../../../services/database')
jest.mock('../dict-arrangements/repositories')

const repository = require('./repositories')

describe('unit-type-arrangements repositories', () => {
  it('should upsert resource', async () => {
    const trx = 'trx'
    const propertyUnitTypeId = 'propertyUnitTypeId'
    const payload = [
      { dictArrangementId: '101', count: 2 },
      { dictArrangementId: '102', count: 4 },
      { dictArrangementId: '103', count: 6 },
      { dictArrangementId: '105', count: 6 },
    ]

    const amenities = [
      { id: 1, dictArrangementId: 101 },
      { id: 2, dictArrangementId: 201 },
    ]

    select.mockResolvedValue(amenities)
    selectDictArrangements.mockResolvedValue([
      { id: 101 }, { id: 102 }, { id: 103 }, { id: 201 },
    ])
    remove.mockResolvedValue()
    insert.mockResolvedValue()

    await expect(repository.upsertBy(propertyUnitTypeId, payload, trx))
      .resolves.toEqual([undefined, undefined, undefined, undefined])

    expect(select).toBeCalledWith('property_unit_type_arrangements', { propertyUnitTypeId }, trx)
    expect(selectDictArrangements).toBeCalled()
    expect(remove).toBeCalledWith('property_unit_type_arrangements', { id: 2 }, trx)
    expect(update).toBeCalledWith(
      'property_unit_type_arrangements',
      { dictArrangementId: '101', count: 2 },
      { propertyUnitTypeId, dictArrangementId: '101' },
      trx,
    )
    expect(insert).toHaveBeenNthCalledWith(
      1, 'property_unit_type_arrangements', { propertyUnitTypeId, dictArrangementId: '102', count: 4 }, trx,
    )
    expect(insert).toHaveBeenNthCalledWith(
      2, 'property_unit_type_arrangements', { propertyUnitTypeId, dictArrangementId: '103', count: 6 }, trx,
    )
  })
})
