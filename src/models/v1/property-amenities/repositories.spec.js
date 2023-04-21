const {
  select, insert, update, remove,
} = require('../../../services/database')
const { selectBy: selectDictAmenitites } = require('../dict-amenities/repositories')

jest.mock('../../../services/database')
jest.mock('../dict-amenities/repositories')

const repository = require('./repositories')

describe('property-amenities repositories', () => {
  const trx = 'trx'
  const propertyId = 'propertyId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should upsert resource', async () => {
    const payload = [
      { dictAmenityId: '101', count: 2 },
      { dictAmenityId: '102', count: 4 },
      { dictAmenityId: '103', count: 6 },
      { dictAmenityId: '105', count: 6 },
    ]
    const amenities = [
      { id: 1, dictAmenityId: 101 },
      { id: 2, dictAmenityId: 201 },
    ]

    select.mockResolvedValue(amenities)
    selectDictAmenitites.mockResolvedValue([
      { id: 101 }, { id: 102 }, { id: 103 }, { id: 201 },
    ])
    remove.mockResolvedValue()
    insert.mockResolvedValue()

    await expect(repository.upsertBy(propertyId, payload, trx))
      .resolves.toEqual([undefined, undefined, undefined, undefined])

    expect(select).toBeCalledWith('property_amenities', { propertyId }, trx)
    expect(selectDictAmenitites).toBeCalled()
    expect(remove).toBeCalledWith('property_amenities', { id: 2 }, trx)
    expect(update).toBeCalledWith(
      'property_amenities', { dictAmenityId: '101', count: 2 }, { propertyId, dictAmenityId: '101' }, trx,
    )
    expect(insert).toHaveBeenNthCalledWith(
      1, 'property_amenities', { propertyId, dictAmenityId: '102', count: 4 }, trx,
    )
    expect(insert).toHaveBeenNthCalledWith(
      2, 'property_amenities', { propertyId, dictAmenityId: '103', count: 6 }, trx,
    )
  })

  it('should return undefined', async () => {
    await expect(repository.upsertBy(propertyId, undefined, trx))
      .resolves.toBeUndefined()
  })
})
