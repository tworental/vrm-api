const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('website-page-tags repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'website_page_tags', jsonFields: ['tag'] }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
