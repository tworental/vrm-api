const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('guests repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'guests',
      jsonFields: ['parlance', 'labels'],
      methods: {
        withBooking: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
