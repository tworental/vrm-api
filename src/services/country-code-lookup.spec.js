const lookup = require('country-code-lookup')

jest.mock('country-code-lookup')

const service = require('./country-code-lookup')

describe('country-code-lookup service', () => {
  it('should return country by ISO code', () => {
    const iso = 'iso'
    const response = 'response'

    lookup.byIso.mockReturnValue({ country: response })

    expect(service.getByISO(iso)).toEqual(response)
    expect(lookup.byIso).toBeCalledWith(iso)
  })

  it('should return country code if ISO code does not exist', () => {
    const iso = 'iso'

    lookup.byIso.mockReturnValue(null)

    expect(service.getByISO(iso)).toEqual(iso)
    expect(lookup.byIso).toBeCalledWith(iso)
  })
})
