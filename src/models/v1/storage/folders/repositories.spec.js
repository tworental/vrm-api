const dao = require('../../../../services/dao')

jest.mock('../../../../services/dao')

const repository = require('./repositories')

describe('storage-folders-providers repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'storage_folders',
      uuidField: 'uuid',
      jsonFields: ['labels'],
      softDelete: true,
      methods: {
        getTreeIds: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
