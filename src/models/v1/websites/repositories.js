const dao = require('../../../services/dao')

const { TABLE_NAME, WEBSITES_S3_DIR } = require('./constants')

module.exports = dao({
  tableName: TABLE_NAME,
  storageDir: WEBSITES_S3_DIR,
})
