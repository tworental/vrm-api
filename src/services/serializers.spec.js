const serializersService = require('./serializers')

describe('serializers service', () => {
  const payload = { name: 'John', languages: ['pl', 'de'] }

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should convert to json string', () => {
    expect(serializersService.convertToJsonString(payload))
      .toEqual(JSON.stringify(payload))
  })

  it('should coerce to boolean', () => {
    expect(serializersService.coerceToBoolean('1'))
      .toBeTruthy()
  })

  it('should apply middlewares to fields', () => {
    expect(serializersService.applyToFields(JSON.stringify, ['languages'], payload))
      .toEqual({ name: payload.name, languages: JSON.stringify(payload.languages) })
  })

  it('should apply middlewares to fields when field does not exists', () => {
    expect(serializersService.applyToFields(JSON.stringify, ['some'], payload))
      .toEqual({ name: payload.name, languages: payload.languages })
  })

  describe('serialize', () => {
    const data = { address: '14 Tottenham Court Road', city: 'London', country: 'England' }

    it('should serialize single object', () => {
      expect(serializersService.serialize(['address', 'city'], data))
        .toEqual({ address: data.address, city: data.city })
    })

    it('should serialize single array', () => {
      expect(serializersService.serialize(['address', 'city'], [data], { key: 'value' }))
        .toEqual([{ address: data.address, city: data.city, key: 'value' }])
    })
  })
})
