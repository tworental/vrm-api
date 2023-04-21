const path = require('path')
const { v4: uuidv4 } = require('uuid')

const {
  PROTECTED_ATTRS,
  sum: originalSum,
  select,
  insert,
  update,
  remove,
  selectOne,
} = require('./database')

const { applyToFields, convertToJsonString } = require('./serializers')
const { mimeFromFile } = require('./mime')
const { upload, deleteFiles } = require('./s3')

module.exports = (opts) => {
  const {
    tableName,
    cacheKeyPrefix = tableName,
    uuidField = null,
    jsonFields = [],
    methods = {},
    storageDir = '',
    softDelete = false,
  } = opts

  if (!tableName) {
    throw new Error('The "tableName" attribute is required for the DAO service.')
  }

  if (!Array.isArray(jsonFields)) {
    throw new Error('The "jsonFields" attribute should be an array.')
  }

  if (!methods || methods.constructor !== Object) {
    throw new Error('The "methods" attribute should be as an object.')
  }

  const withSoftDeletion = (handler) => (...args) => {
    const queryBuilder = handler(...args)

    if (softDelete && queryBuilder) {
      /**
       * First element which is an object is a param with conditions.
       */
      const conditions = args.find((item) => !!item && item.constructor === Object)
        || { [PROTECTED_ATTRS.DELETED]: 0 }

      if (!Number(conditions[PROTECTED_ATTRS.DELETED])) {
        return queryBuilder.whereNull(`${tableName}.deleted_at`)
      }
      return queryBuilder.whereNotNull(`${tableName}.deleted_at`)
    }
    return queryBuilder
  }

  const create = (data, trx) => {
    const extra = uuidField ? {
      [uuidField]: uuidv4(),
    } : {}

    return insert(tableName, applyToFields(convertToJsonString, jsonFields, { ...data, ...extra }), trx)
  }

  const updateBy = withSoftDeletion((conditions, data, trx) => (
    update(tableName, applyToFields(convertToJsonString, jsonFields, data), conditions, trx)
  ))

  const deleteBy = (conditions, trx) => {
    const hardDelete = Boolean(conditions && Number(conditions[PROTECTED_ATTRS.DELETED]))

    if (softDelete && !hardDelete) {
      return updateBy(conditions, { deletedAt: new Date(Date.now()) }, trx)
    }
    return remove(tableName, conditions, trx)
  }

  const selectBy = withSoftDeletion((conditions, trx) => (
    select(tableName, conditions, trx)
  ))

  const selectOneBy = withSoftDeletion((conditions, trx) => (
    selectOne(tableName, conditions, trx)
  ))

  const upsertOneBy = async (conditions, trx) => {
    let item = await selectOneBy(conditions, trx)

    if (!item) {
      item = await create(conditions)
        .then((id) => selectOneBy({ id }))
    }
    return item
  }

  const sum = withSoftDeletion((field, conditions, trx) => (
    originalSum(tableName, field, conditions, trx)
  ))

  const generateFilesPath = (file) => (accountId, id) => (
    `${accountId}/${storageDir}/${id || ''}/${uuidv4()}${path.extname(file.name)}`.replace(/\/\/+/g, '/')
  )

  const uploadFile = (file, currentFile, extra = {}) => async (...args) => {
    if (!file) return null
    if (!file.data) throw new Error('Wrong File Data')

    const { acl = 'private', altName } = extra

    const s3Path = generateFilesPath(file)(...args)

    const originalFileName = altName || file.name

    const { ext, mime } = await mimeFromFile(file)

    const { Location } = await upload(s3Path, Buffer.from(file.data, 'binary'), {
      ContentType: mime,
      ACL: acl,
      Metadata: {
        'alt-name': encodeURIComponent(originalFileName),
      },
    })

    try {
      await deleteFiles([currentFile])
    } catch (error) {}

    return {
      ext,
      originalFileName,
      url: Location,
      path: s3Path,
      mimeType: mime,
      size: file.size,
    }
  }

  return {
    tableName,
    cacheKeyPrefix,
    create,
    updateBy,
    upsertOneBy,
    deleteBy,
    selectBy,
    selectOneBy,
    withSoftDeletion,
    generateFilesPath,
    uploadFile,
    sum,
    ...methods,
  }
}
