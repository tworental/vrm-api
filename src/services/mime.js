const path = require('path')
const isSvg = require('is-svg')
const { fromBuffer } = require('file-type')

exports.mimeFromFile = async (file) => {
  const buffer = Buffer.from(file.data, 'binary')

  if (isSvg(buffer)) {
    return { ext: 'svg', mime: 'image/svg+xml' }
  }

  const results = await fromBuffer(buffer)

  if (results) return results

  const ext = path.extname(file.name).slice(1)

  return { ext, mime: 'application/octet-stream' }
}
