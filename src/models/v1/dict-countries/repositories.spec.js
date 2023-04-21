const countries = require('country-region-data')

jest.mock('country-region-data')

const repository = require('./repositories')

describe('dict-countries repositories', () => {
  it('should select dictionary countries', async () => {
    expect(repository.selectAll()).toEqual(countries)
  })
})
