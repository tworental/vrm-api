const dao = require('../../../../services/dao')
const { apiUrl } = require('../../../../services/frontend')

jest.mock('../../../../services/dao')
jest.mock('../../../../services/frontend')

const repository = require('./repositories')

describe('storage-files-providers repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'storage_files',
      uuidField: 'uuid',
      jsonFields: ['labels'],
      storageDir: 'storage',
      softDelete: true,
      methods: {
        storageFileUrl: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  describe('storageFileUrl', () => {
    const headers = {
      authorization: 'Bearer accessToken',
    }

    it('should return null for not existed file', () => {
      const file = { uuid: null }

      expect(repository.methods.storageFileUrl(file, headers)).toBeNull()
    })

    it('should return public url for unauthorized', () => {
      const file = { uuid: 'uuid', publicUrl: 'publicUrl' }

      expect(repository.methods.storageFileUrl(file, {})).toBe(file.publicUrl)
    })

    it('should return api url', () => {
      const file = { uuid: 'uuid', publicUrl: 'publicUrl' }
      const url = 'apiUrl'

      apiUrl.mockReturnValue(url)

      expect(repository.methods.storageFileUrl(file, headers)).toBe(url)
      expect(apiUrl).toBeCalledWith('storage/files/uuid/preview', {
        accessToken: 'accessToken',
      })
    })
  })
})
