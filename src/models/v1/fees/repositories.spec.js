const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('fees repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'fees',
      methods: {
        getLogicType: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  describe('getLogicType', () => {
    it('should return percent for rateType = percentage', () => {
      expect(repository.methods.getLogicType({ rateType: 'percentage' }))
        .toBe('percent')
    })

    it('should return per_room_per_night for chargeType = SINGLE_CHARGE and frequency = PER_NIGHT', () => {
      expect(repository.methods.getLogicType({ chargeType: 'singleCharge', frequency: 'perNight' }))
        .toBe('per_room_per_night')
    })

    it('should return per_booking for chargeType = SINGLE_CHARGE and frequency = PER_STAY', () => {
      expect(repository.methods.getLogicType({ chargeType: 'singleCharge', frequency: 'perStay' }))
        .toBe('per_booking')
    })

    it('should return per_person_per_night for chargeType = PER_PERSON and frequency = PER_NIGHT', () => {
      expect(repository.methods.getLogicType({ chargeType: 'perPerson', frequency: 'perNight' }))
        .toBe('per_person_per_night')
    })

    it('should return per_person for chargeType = PER_PERSON and frequency = PER_STAY', () => {
      expect(repository.methods.getLogicType({ chargeType: 'perPerson', frequency: 'perStay' }))
        .toBe('per_person')
    })
  })
})
