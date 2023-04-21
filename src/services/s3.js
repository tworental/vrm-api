const config = require('config')
const s3Zip = require('s3-zip')

const { S3 } = require('./aws')

exports.init = () => new S3({
  region: config.get('aws.region'),
  accessKeyId: config.get('aws.accessKey'),
  secretAccessKey: config.get('aws.accessSecretKey'),
  signatureVersion: 'v4',
  apiVersion: '2006-03-01',
})

exports.getObject = (key) => new Promise((resolve, reject) => {
  exports.init().getObject({
    Key: key,
    Bucket: config.get('aws.s3.storage'),
  }, (error, result) => (error ? reject(error) : resolve(result)))
})

exports.getSignedUrl = (key, expires = 60) => new Promise((resolve, reject) => {
  if (!key) return resolve(null)

  return exports.init().getSignedUrl('getObject', {
    Key: key,
    Bucket: config.get('aws.s3.storage'),
    Expires: expires,
  }, (error, result) => (error ? reject(error) : resolve(result)))
})

exports.getObjectStream = (key) => exports.init().getObject({
  Key: key,
  Bucket: config.get('aws.s3.storage'),
}).createReadStream()

exports.listObjects = (path) => new Promise((resolve, reject) => {
  exports.init().listObjectsV2({
    Bucket: config.get('aws.s3.storage'),
    Prefix: path,
  }, (error, result) => (error ? reject(error) : resolve(result)))
})

exports.upload = (key, stream, params = {}) => new Promise((resolve, reject) => {
  exports.init().upload({
    Bucket: config.get('aws.s3.storage'),
    Key: key,
    Body: stream,
    ...params,
  }, (error, result) => (error ? reject(error) : resolve(result)))
})

exports.deleteFiles = (keys) => new Promise((resolve, reject) => {
  if (!Array.isArray(keys) || !keys.length) {
    return resolve()
  }

  return exports.init().deleteObjects({
    Bucket: config.get('aws.s3.storage'),
    Delete: {
      Objects: keys.map((value) => ({
        Key: value.replace(/^https?:\/\/[^/]+\//, ''),
      })),
    },
  }, (error, result) => (error ? reject(error) : resolve(result)))
})

exports.zipFiles = async (keys, mappedFiles) => {
  if (!Array.isArray(keys) || !keys.length) {
    throw new Error('You should pass minimum one key to download')
  }

  const objectsKeys = await Promise.all(
    keys.map((key) => (
      exports.getObject(key)
        .then(() => key)
        .catch(() => null)
    )),
  ).then((items) => items.filter(Boolean))

  if (!objectsKeys.length) {
    throw new Error('You should pass minimum one existed file key')
  }

  return s3Zip.archive({
    s3: exports.init(),
    bucket: config.get('aws.s3.storage'),
    preserveFolderStructure: true,
  }, '', objectsKeys, mappedFiles)
}
