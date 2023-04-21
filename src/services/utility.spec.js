const camelize = require('camelcase-keys')
const snakeize = require('snakecase-keys')

jest.mock('camelcase-keys')
jest.mock('snakecase-keys')

const utilityService = require('./utility')

describe('utility service', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should transform object keys to camelcase without extra options', () => {
    const obj = {}

    expect(utilityService.camelcaseKeys(obj)).toBeUndefined()
    expect(camelize).toBeCalledWith(obj, { deep: true })
  })

  it('should transform object keys to camelcase with extra options', () => {
    const obj = {}

    expect(utilityService.camelcaseKeys(obj, { deep: false })).toBeUndefined()
    expect(camelize).toBeCalledWith(obj, { deep: false })
  })

  it('should transform object keys to snakecase without extra options', () => {
    const obj = {}

    expect(utilityService.snakecaseKeys(obj)).toBeUndefined()
    expect(snakeize).toBeCalledWith(obj, { deep: true })
  })

  it('should transform object keys to snakecase with extra options', () => {
    const obj = {}

    expect(utilityService.snakecaseKeys(obj, { deep: false })).toBeUndefined()
    expect(snakeize).toBeCalledWith(obj, { deep: false })
  })

  it('should find child objects by id', () => {
    const items = [
      { id: 1, folderId: null, name: 'Dir 1' },
      { id: 2, folderId: null, name: 'Dir 2' },
      { id: 3, folderId: 1, name: 'Dir 3' },
      { id: 4, folderId: 3, name: 'Dir 4' },
    ]

    expect(utilityService.arrayToFlatTree(items, 1, 'folderId')).toEqual([
      items[2], items[3],
    ])
  })

  it('should returns current object if folderId is the same as id', () => {
    const items = [
      { id: 1, folderId: 1, name: 'Dir 1' },
    ]

    expect(utilityService.arrayToFlatTree(items, 1, 'folderId')).toEqual(items)
  })
})
