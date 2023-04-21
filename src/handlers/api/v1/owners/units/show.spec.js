const roundTo = require('round-to')

const { handler } = require('../../../../../services/http')
const { sumArray, avgArray } = require('../../../../../services/number')
const {
  selectOneBy: selectUnitBy,
  withProperty,
} = require('../../../../../models/v1/units/repositories')
const {
  selectBy: selectPropertyImagesBy,
  withFiles,
} = require('../../../../../models/v1/property-images/repositories')
const {
  occupancyByYearAndMonth,
  calculateOccupancy,
} = require('../../../../../models/v1/statistics/repositories')

const httpHandler = require('./show')

jest.mock('round-to')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/number')
jest.mock('../../../../../models/v1/units/repositories')
jest.mock('../../../../../models/v1/property-images/repositories')
jest.mock('../../../../../models/v1/statistics/repositories')

describe('GET v1/owners/units/:id', () => {
  const ownerId = 1
  const accountId = 1
  const id = 1

  it('should display a resource', async () => {
    const data = {
      id: 1,
      name: 'PropertyName',
      photo: 'url',
      address: 'address',
      room: 'unit',
      bookedNights: 100,
      occupancy: 1,
      avgNightlyRate: 100,
    }
    const response = { data }
    const unit = {
      id: 1,
      propertyUnitTypeId: 1,
      propertyName: 'PropertyName',
      name: 'unit',
      address: {
        formattedAddress: 'address',
      },
    }
    const images = [
      { id: 1, propertyUnitTypeId: 1, publicUrl: 'url' },
    ]
    const occupancyData = [
      { propertyUnitTypeUnitId: 1, occupancyByUnit: 'occupancyByUnit' },
    ]

    const unitOccupancy1 = {
      totalNights: 10,
      occupancy: 1,
    }

    const json = jest.fn().mockImplementation((args) => args)

    const ownerWhere = jest.fn().mockResolvedValue(unit)
    const accountWhere = jest.fn().mockReturnValue({ where: ownerWhere })
    const unitsWhere = jest.fn().mockReturnValue({ where: accountWhere })
    const select = jest.fn().mockReturnValue({ where: unitsWhere })
    withProperty.mockReturnValue({ select })

    const where = jest.fn().mockResolvedValue(images)
    const whereMain = jest.fn().mockReturnValue({ where })
    withFiles.mockReturnValue({ where: whereMain })

    const occupancyFn = jest.fn().mockResolvedValue(occupancyData)

    occupancyByYearAndMonth.mockReturnValue(occupancyFn)

    calculateOccupancy.mockReturnValueOnce({ data: [unitOccupancy1] })

    sumArray.mockReturnValue(100)
    avgArray.mockReturnValue(100)

    roundTo.mockImplementation((a) => a)

    await expect(httpHandler({ user: { id: ownerId, accountId }, params: { id } }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith({ data })
    expect(selectUnitBy).toBeCalled()
    expect(withProperty).toBeCalled()
    expect(select).toBeCalledWith(['address'])
    expect(accountWhere).toBeCalledWith('account_id', '=', accountId)
    expect(ownerWhere).toBeCalledWith('owner_id', '=', ownerId)
    expect(unitsWhere).toBeCalledWith('property_unit_type_units.id', '=', id)
    expect(selectPropertyImagesBy).toBeCalled()
    expect(withFiles).toBeCalled()
    expect(whereMain).toBeCalledWith('main', 1)
    expect(where).toBeCalledWith('propertyUnitTypeId', 1)
    expect(occupancyByYearAndMonth).toBeCalledWith(accountId)
    expect(occupancyFn).toBeCalledWith(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      [1],
    )
    expect(calculateOccupancy).toBeCalledWith([[occupancyData[0]]])
    expect(sumArray).toBeCalledWith([occupancyData[0]], 'totalNights')
    expect(avgArray).toBeCalledWith([occupancyData[0]], 'amount')
    expect(roundTo).toBeCalled()
  })

  it('should display a resource without extra fields', async () => {
    const data = {
      id: 1,
      name: 'PropertyName',
      photo: null,
      address: null,
      room: 'unit',
      bookedNights: 100,
      occupancy: 1,
      avgNightlyRate: 100,
    }
    const response = { data }
    const unit = {
      id: 1,
      propertyUnitTypeId: 1,
      propertyName: 'PropertyName',
      name: 'unit',
    }
    const images = []
    const occupancyData = [
      { propertyUnitTypeUnitId: 1, occupancyByUnit: 'occupancyByUnit' },
    ]

    const unitOccupancy1 = {
      totalNights: 10,
      occupancy: 1,
    }

    const json = jest.fn().mockImplementation((args) => args)

    const ownerWhere = jest.fn().mockResolvedValue(unit)
    const accountWhere = jest.fn().mockReturnValue({ where: ownerWhere })
    const unitsWhere = jest.fn().mockReturnValue({ where: accountWhere })
    const select = jest.fn().mockReturnValue({ where: unitsWhere })
    withProperty.mockReturnValue({ select })

    const where = jest.fn().mockResolvedValue(images)
    const whereMain = jest.fn().mockReturnValue({ where })
    withFiles.mockReturnValue({ where: whereMain })

    const occupancyFn = jest.fn().mockResolvedValue(occupancyData)

    occupancyByYearAndMonth.mockReturnValue(occupancyFn)

    calculateOccupancy.mockReturnValueOnce({ data: [unitOccupancy1] })

    sumArray.mockReturnValue(100)
    avgArray.mockReturnValue(100)

    roundTo.mockImplementation((a) => a)

    await expect(httpHandler({ user: { id: ownerId, accountId }, params: { id } }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith({ data })
    expect(selectUnitBy).toBeCalled()
    expect(withProperty).toBeCalled()
    expect(select).toBeCalledWith(['address'])
    expect(accountWhere).toBeCalledWith('account_id', '=', accountId)
    expect(ownerWhere).toBeCalledWith('owner_id', '=', ownerId)
    expect(unitsWhere).toBeCalledWith('property_unit_type_units.id', '=', id)
    expect(selectPropertyImagesBy).toBeCalled()
    expect(withFiles).toBeCalled()
    expect(whereMain).toBeCalledWith('main', 1)
    expect(where).toBeCalledWith('propertyUnitTypeId', 1)
    expect(occupancyByYearAndMonth).toBeCalledWith(accountId)
    expect(occupancyFn).toBeCalledWith(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      [1],
    )
    expect(calculateOccupancy).toBeCalledWith([[occupancyData[0]]])
    expect(sumArray).toBeCalledWith([occupancyData[0]], 'totalNights')
    expect(avgArray).toBeCalledWith([occupancyData[0]], 'amount')
    expect(roundTo).toBeCalled()
  })
})
