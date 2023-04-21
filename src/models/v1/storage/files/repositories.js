const dao = require('../../../../services/dao')
const { apiUrl } = require('../../../../services/frontend')

const { TABLE_NAME } = require('./constants')

const storageFileUrl = (file, headers) => {
  if (!file || !file.uuid) return null

  if (headers && headers.authorization) {
    const [, accessToken] = headers.authorization.split('Bearer')

    return apiUrl(`storage/files/${file.uuid}/preview`, {
      accessToken: accessToken.trim(),
    })
  }
  return file.publicUrl
}

module.exports = dao({
  tableName: TABLE_NAME,
  uuidField: 'uuid',
  jsonFields: ['labels'],
  storageDir: 'storage',
  softDelete: true,
  methods: {
    storageFileUrl,
  },
})
