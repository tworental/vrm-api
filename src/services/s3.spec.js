const { S3 } = require('aws-sdk')
const config = require('config')
const { archive } = require('s3-zip')

jest.mock('aws-sdk')
jest.mock('config')
jest.mock('s3-zip')

const s3 = require('./s3')

describe('S3 service', () => {
  afterEach(() => jest.clearAllMocks())

  describe('init', () => {
    it('should initialize an S3 instance', async () => {
      const s3Instance = { data: 's3' }
      S3.mockImplementation(() => s3Instance)

      expect(await s3.init()).toEqual(s3Instance)

      expect(S3).toBeCalledWith({
        region: 'aws.region',
        accessKeyId: 'aws.accessKey',
        secretAccessKey: 'aws.accessSecretKey',
        signatureVersion: 'v4',
        apiVersion: '2006-03-01',
      })
      expect(config.get).toHaveBeenNthCalledWith(1, 'aws.region')
      expect(config.get).toHaveBeenNthCalledWith(2, 'aws.accessKey')
      expect(config.get).toHaveBeenNthCalledWith(3, 'aws.accessSecretKey')
    })
  })

  describe('getObject', () => {
    it('should get an object from the bucket', async () => {
      const result = { data: 'result' }
      const getObject = jest.fn().mockImplementation(
        (options, callback) => callback(undefined, result),
      )
      jest.spyOn(s3, 'init').mockReturnValue({
        getObject,
      })

      const key = 'key'
      expect(await s3.getObject(key)).toEqual(result)

      expect(s3.init).toBeCalled()
      expect(getObject).toBeCalledWith({
        Key: key,
        Bucket: 'aws.s3.storage',
      }, expect.any(Function))
      expect(config.get).toBeCalledWith('aws.s3.storage')
    })

    it('should fail to get an object from the bucket', async () => {
      const error = new Error('failed')
      const getObject = jest.fn().mockImplementation(
        (options, callback) => callback(error),
      )
      jest.spyOn(s3, 'init').mockReturnValue({
        getObject,
      })

      const key = 'key'
      await expect(s3.getObject(key)).rejects.toThrow(error)
    })
  })

  describe('getSignedUrl', () => {
    it('should get an object signed url from the bucket', async () => {
      const result = 'presignUrl'

      const getSignedUrl = jest.fn().mockImplementation(
        (name, options, callback) => callback(undefined, result),
      )

      jest.spyOn(s3, 'init').mockReturnValue({
        getSignedUrl,
      })

      const path = 'path'

      expect(await s3.getSignedUrl(path, 30)).toEqual(result)

      expect(s3.init).toBeCalled()
      expect(getSignedUrl).toBeCalledWith('getObject', {
        Key: path,
        Bucket: 'aws.s3.storage',
        Expires: 30,
      }, expect.any(Function))
      expect(config.get).toBeCalledWith('aws.s3.storage')
    })

    it('should return null if key does not exists', async () => {
      expect(await s3.getSignedUrl()).toEqual(null)
      expect(s3.init).not.toBeCalled()
    })

    it('should fail to get an object from the bucket', async () => {
      const error = new Error('failed')

      const getSignedUrl = jest.fn().mockImplementation(
        (name, options, callback) => callback(error),
      )

      jest.spyOn(s3, 'init').mockReturnValue({
        getSignedUrl,
      })

      const path = 'path'

      await expect(s3.getSignedUrl(path)).rejects.toThrow(error)

      expect(getSignedUrl).toBeCalledWith('getObject', {
        Key: path,
        Bucket: 'aws.s3.storage',
        Expires: 60,
      }, expect.any(Function))
    })
  })

  describe('getObjectStream', () => {
    it('should get an object stream from the bucket', async () => {
      const result = { data: 'result' }
      const createReadStream = jest.fn().mockReturnValue(result)
      const getObject = jest.fn().mockReturnValue({
        createReadStream,
      })
      jest.spyOn(s3, 'init').mockReturnValue({
        getObject,
      })

      const key = 'key'
      expect(await s3.getObjectStream(key)).toEqual(result)

      expect(s3.init).toBeCalled()
      expect(getObject).toBeCalledWith({
        Key: key,
        Bucket: 'aws.s3.storage',
      })
      expect(config.get).toBeCalledWith('aws.s3.storage')
      expect(createReadStream).toBeCalled()
    })
  })

  describe('listObjects', () => {
    it('should list objects from the bucket', async () => {
      const result = { data: 'result' }

      const listObjectsV2 = jest.fn().mockImplementation(
        (options, callback) => callback(undefined, result),
      )

      jest.spyOn(s3, 'init').mockReturnValue({
        listObjectsV2,
      })

      const path = 'path'

      expect(await s3.listObjects(path)).toEqual(result)

      expect(s3.init).toBeCalled()
      expect(listObjectsV2).toBeCalledWith({
        Prefix: path,
        Bucket: 'aws.s3.storage',
      }, expect.any(Function))
      expect(config.get).toBeCalledWith('aws.s3.storage')
    })

    it('should fail to list objects from the bucket', async () => {
      const error = new Error('failed')

      const listObjectsV2 = jest.fn().mockImplementation(
        (options, callback) => callback(error),
      )

      jest.spyOn(s3, 'init').mockReturnValue({
        listObjectsV2,
      })

      const path = 'path'

      await expect(s3.listObjects(path)).rejects.toThrow(error)
    })
  })

  describe('upload', () => {
    it('should upload an object to the bucket', async () => {
      const result = { data: 'result' }

      const upload = jest.fn().mockImplementation(
        (options, callback) => callback(undefined, result),
      )

      jest.spyOn(s3, 'init').mockReturnValue({
        upload,
      })

      const key = 'key'
      const stream = 'stream'

      expect(await s3.upload(key, stream)).toEqual(result)

      expect(s3.init).toBeCalled()
      expect(upload).toBeCalledWith({
        Key: key,
        Body: stream,
        Bucket: 'aws.s3.storage',
      }, expect.any(Function))
      expect(config.get).toBeCalledWith('aws.s3.storage')
    })

    it('should fail to upload an object to the bucket', async () => {
      const error = new Error('failed')

      const upload = jest.fn().mockImplementation(
        (options, callback) => callback(error),
      )

      jest.spyOn(s3, 'init').mockReturnValue({
        upload,
      })

      const key = 'key'

      await expect(s3.upload(key)).rejects.toThrow(error)
    })
  })

  describe('deleteFiles', () => {
    it('should delete objects from the bucket', async () => {
      const result = { data: 'result' }

      const deleteObjects = jest.fn().mockImplementation(
        (options, callback) => callback(undefined, result),
      )

      jest.spyOn(s3, 'init').mockReturnValue({
        deleteObjects,
      })

      const keys = ['key']

      expect(await s3.deleteFiles(keys)).toEqual(result)

      expect(s3.init).toBeCalled()
      expect(deleteObjects).toBeCalledWith({
        Bucket: 'aws.s3.storage',
        Delete: {
          Objects: [
            { Key: 'key' },
          ],
        },
      }, expect.any(Function))

      expect(config.get).toBeCalledWith('aws.s3.storage')
    })

    it('should resolve if there are no objects', async () => {
      const deleteObjects = jest.fn()

      jest.spyOn(s3, 'init').mockReturnValue({
        deleteObjects,
      })

      expect(await s3.deleteFiles([])).toBeUndefined()

      expect(s3.init).not.toBeCalled()
      expect(deleteObjects).not.toBeCalledWith()
    })

    it('should fail to delete an object from the bucket', async () => {
      const error = new Error('failed')

      const deleteObjects = jest.fn().mockImplementation(
        (options, callback) => callback(error),
      )

      jest.spyOn(s3, 'init').mockReturnValue({
        deleteObjects,
      })

      const keys = ['key']

      await expect(s3.deleteFiles(keys)).rejects.toThrow(error)
    })
  })

  describe('zipFiles', () => {
    it('should returns buffered zipped files', async () => {
      const keys = ['key1', 'key2']
      const zip = 'zippedFiles'
      const mapping = 'mapping'

      archive.mockResolvedValue(zip)

      const initMock = jest.spyOn(s3, 'init').mockReturnValue('s3init')
      const getObjectMock = jest.spyOn(s3, 'getObject').mockResolvedValue()

      await expect(s3.zipFiles(keys, mapping)).resolves.toEqual(zip)

      expect(getObjectMock).toHaveBeenNthCalledWith(1, keys[0])
      expect(getObjectMock).toHaveBeenNthCalledWith(2, keys[1])
      expect(initMock).toBeCalled()
      expect(archive).toBeCalledWith({
        s3: 's3init',
        bucket: 'aws.s3.storage',
        preserveFolderStructure: true,
      }, '', keys, mapping)
    })

    it('should throw error when object keys does not exists', async () => {
      const error = new Error('You should pass minimum one existed file key')

      jest.spyOn(s3, 'getObject').mockRejectedValue()

      await expect(s3.zipFiles(['key1', 'key2'])).rejects.toThrow(error)

      expect(archive).not.toBeCalled()
    })

    it('should throw error when key is not passed', async () => {
      const error = new Error('You should pass minimum one key to download')

      await expect(s3.zipFiles([])).rejects.toThrow(error)

      expect(archive).not.toBeCalled()
    })
  })
})
