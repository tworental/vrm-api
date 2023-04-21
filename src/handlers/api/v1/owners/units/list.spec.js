const roundTo = require('round-to')

const { handler } = require('../../../../../services/http')
const { sumArray, avgArray } = require('../../../../../services/number')
const {
  selectBy: selectUnitsBy,
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

const httpHandler = require('./list')

jest.mock('round-to')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/number')
jest.mock('../../../../../models/v1/units/repositories')
jest.mock('../../../../../models/v1/property-images/repositories')
jest.mock('../../../../../models/v1/statistics/repositories')

describe('GET v1/owners/units', () => {
  const userId = 1
  const accountId = 1

  it('should display all resources', async () => {
    const data = [
      {
        id: 1,
        name: 'PropertyName',
        photo: 'url',
        address: 'address',
        room: 'unit',
        bookedNights: 100,
        occupancy: 1,
        avgNightlyRate: 100,
      },
      {
        id: 2,
        name: 'PropertyName',
        photo: null,
        address: null,
        room: 'unit',
        bookedNights: 100,
        occupancy: 2,
        avgNightlyRate: 100,
      },
    ]
    const response = { data }
    const units = [
      {
        id: 1,
        propertyUnitTypeId: 1,
        propertyName: 'PropertyName',
        name: 'unit',
        address: {
          formattedAddress: 'address',
        },
      },
      {
        id: 2,
        propertyUnitTypeId: 2,
        propertyName: 'PropertyName',
        name: 'unit',
      },
    ]
    const images = [
      { id: 1, propertyUnitTypeId: 1, publicUrl: 'url' },
    ]
    const occupancyData = [
      { propertyUnitTypeUnitId: 1, occupancyByUnit: 'occupancyByUnit' },
      { propertyUnitTypeUnitId: 2, occupancyByUnit: 'occupancyByUnit' },
    ]

    const unitOccupancy1 = {
      totalNights: 10,
      occupancy: 1,
    }
    const unitOccupancy2 = {
      totalNights: 20,
      occupancy: 2,
    }

    const json = jest.fn().mockImplementation((args) => args)

    const ownerWhere = jest.fn().mockResolvedValue(units)
    const accountWhere = jest.fn().mockReturnValue({ where: ownerWhere })
    const select = jest.fn().mockReturnValue({ where: accountWhere })
    withProperty.mockReturnValue({ select })

    const whereIn = jest.fn().mockResolvedValue(images)
    const whereMain = jest.fn().mockReturnValue({ whereIn })
    withFiles.mockReturnValue({ where: whereMain })

    const occupancyFn = jest.fn().mockResolvedValue(occupancyData)

    occupancyByYearAndMonth.mockReturnValue(occupancyFn)

    calculateOccupancy.mockReturnValueOnce({ data: [unitOccupancy1] })
    calculateOccupancy.mockReturnValueOnce({ data: [unitOccupancy2] })

    sumArray.mockReturnValue(100)
    avgArray.mockReturnValue(100)

    roundTo.mockImplementation((a) => a)

    await expect(httpHandler({ user: { id: userId, accountId } }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith({ data })
    expect(selectUnitsBy).toBeCalled()
    expect(withProperty).toBeCalled()
    expect(select).toBeCalledWith(['address'])
    expect(accountWhere).toBeCalledWith('account_id', '=', accountId)
    expect(ownerWhere).toBeCalledWith('owner_id', '=', userId)
    expect(selectPropertyImagesBy).toBeCalled()
    expect(withFiles).toBeCalled()
    expect(whereMain).toBeCalledWith('main', 1)
    expect(whereIn).toBeCalledWith('propertyUnitTypeId', [1, 2])
    expect(occupancyByYearAndMonth).toBeCalledWith(accountId)
    expect(occupancyFn).toBeCalledWith(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      [1, 2],
    )
    expect(calculateOccupancy).toBeCalledWith([[occupancyData[0]]])
    expect(calculateOccupancy).toBeCalledWith([[occupancyData[1]]])
    expect(sumArray).toBeCalledWith([occupancyData[0]], 'totalNights')
    expect(sumArray).toBeCalledWith([occupancyData[1]], 'totalNights')
    expect(avgArray).toBeCalledWith([occupancyData[0]], 'amount')
    expect(avgArray).toBeCalledWith([occupancyData[1]], 'amount')
    expect(roundTo).toBeCalled()
  })
})
