const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('property-channel-managers repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'property_channel_managers' }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
