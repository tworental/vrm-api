const isSvg = require('is-svg')
const { fromBuffer } = require('file-type')

jest.mock('is-svg')
jest.mock('file-type')

const mimeService = require('./mime')

describe('mime service', () => {
  const file = { name: 'file.jpg', data: 'data' }

  it('should get pre-defined svg mime', async () => {
    const bufferFrom = jest.spyOn(Buffer, 'from').mockImplementation(() => 'buffer')

    isSvg.mockReturnValue(true)

    await expect(mimeService.mimeFromFile(file))
      .resolves.toEqual({ ext: 'svg', mime: 'image/svg+xml' })

    expect(bufferFrom).toBeCalledWith(file.data, 'binary')
    expect(isSvg).toBeCalledWith('buffer')
    expect(fromBuffer).not.toBeCalled()
  })

  it('should get mime from buffer', async () => {
    const bufferFrom = jest.spyOn(Buffer, 'from').mockImplementation(() => 'buffer')

    isSvg.mockReturnValue(false)
    fromBuffer.mockResolvedValue('mime')

    await expect(mimeService.mimeFromFile(file))
      .resolves.toEqual('mime')

    expect(bufferFrom).toBeCalledWith(file.data, 'binary')
    expect(isSvg).toBeCalledWith('buffer')
    expect(fromBuffer).toBeCalledWith('buffer')
  })

  it('should get not recognized mime', async () => {
    const bufferFrom = jest.spyOn(Buffer, 'from').mockImplementation(() => 'buffer')

    isSvg.mockReturnValue(false)
    fromBuffer.mockResolvedValue()

    await expect(mimeService.mimeFromFile(file))
      .resolves.toEqual({ ext: 'jpg', mime: 'application/octet-stream' })

    expect(bufferFrom).toBeCalledWith(file.data, 'binary')
    expect(isSvg).toBeCalledWith('buffer')
    expect(fromBuffer).toBeCalledWith('buffer')
  })
})
