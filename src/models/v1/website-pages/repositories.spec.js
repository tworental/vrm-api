const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('website-pages repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'website_pages' }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
