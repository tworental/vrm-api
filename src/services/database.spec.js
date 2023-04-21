const { Readable } = require('stream')
const knex = require('knex')
const { attachPaginate } = require('knex-paginate')
const config = require('config')

const { camelcaseKeys } = require('./utility')
const { logDebug, logInfo } = require('./logger')

jest.mock('knex')
jest.mock('knex-paginate')
jest.mock('config')
jest.mock('./utility')
jest.mock('./logger')

const databaseService = require('./database')

describe('database service', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('getConnection', () => {
    let connection

    beforeEach(() => {
      connection = new Readable()
      connection.data = 'getConnection'

      knex.mockReturnValue(connection)
    })

    it('should create a new connection to the database', async () => {
      config.get.mockImplementation((key) => {
        const options = {
          database: {
            client: 'mysql2',
          },
          'database.connection': {
            host: 'database.host',
            port: 'database.port',
            user: 'database.user',
            password: 'database.password',
            database: 'database.name',
          },
        }
        return options[key]
      })

      expect(databaseService.getConnection()).toEqual(connection)

      expect(knex).toBeCalledWith({
        client: 'mysql2',
        wrapIdentifier: expect.any(Function),
        postProcessResponse: expect.any(Function),
        connection: {
          host: 'database.host',
          port: 'database.port',
          user: 'database.user',
          password: 'database.password',
          database: 'database.name',
          typeCast: expect.any(Function),
        },
      })
      expect(attachPaginate).toBeCalled()
      expect(config.get).toHaveBeenNthCalledWith(1, 'database')
      expect(config.get).toHaveBeenNthCalledWith(2, 'database.connection')
    })

    it('should get the same connection on subsequent calls', () => {
      expect(databaseService.getConnection(true)).toEqual(connection)
      expect(databaseService.getConnection()).toEqual(connection)

      expect(knex).toBeCalledTimes(1)
    })

    it('should handle the query event', async () => {
      await databaseService.getConnection(true)

      const queryEvent = {
        method: 'method',
        options: { data: 'options' },
        sql: 'sql',
        bindings: { data: 'bindings' },
      }
      connection.emit('query', queryEvent)

      expect(logInfo).toBeCalledWith('sql-query-fired', {
        method: queryEvent.method,
        options: queryEvent.options,
        sql: queryEvent.sql,
        bindings: queryEvent.bindings,
      })
    })

    it('should handle the query-response event', async () => {
      await databaseService.getConnection(true)

      const queryResponseEvent = { data: 'queryResponseEvent' }
      connection.emit('query-response', queryResponseEvent)

      expect(logDebug).toBeCalledWith('sql-query-response-received', { data: 'queryResponseEvent' })
    })

    it('should change an object keys to snakecase format in wrap identifier', () => {
      const origImpl = jest.fn().mockImplementation((args) => args)

      expect(databaseService.getConnection(true)).toEqual(connection)

      const { wrapIdentifier } = knex.mock.calls[0][0]

      expect(wrapIdentifier('tableName', origImpl)).toEqual('table_name')
    })

    describe('postProcessResponse', () => {
      it('should change value or object keys to camelcase format', () => {
        const payload = {
          user_data: { first_name: 'John' },
        }

        const transformedData = {
          userData: { firstName: 'John' },
        }

        camelcaseKeys.mockReturnValue(transformedData)

        expect(databaseService.getConnection(true)).toEqual(connection)

        const { postProcessResponse } = knex.mock.calls[0][0]

        expect(postProcessResponse(payload)).toEqual(transformedData)
      })

      it('should change array of objects keys to camelcase format', () => {
        const payload = [{
          user_data: { first_name: 'John' },
        }]

        const transformedData = {
          userData: { firstName: 'John' },
        }

        camelcaseKeys.mockReturnValue(transformedData)

        expect(databaseService.getConnection(true)).toEqual(connection)

        const { postProcessResponse } = knex.mock.calls[0][0]

        expect(postProcessResponse(payload)).toEqual([transformedData])
      })
    })

    describe('typeCast', () => {
      it('should type cast json fields', () => {
        const parseResult = 'parseResult'
        const parse = jest.spyOn(JSON, 'parse').mockReturnValue(parseResult)

        expect(databaseService.getConnection(true)).toEqual(connection)

        const { typeCast } = knex.mock.calls[0][0].connection

        const jsonString = 'jsonString'
        const jsonField = {
          type: 'JSON',
          string: jest.fn().mockReturnValue(jsonString),
        }
        expect(typeCast(jsonField)).toBe(parseResult)

        expect(jsonField.string).toBeCalled()
        expect(parse).toBeCalledWith(jsonString)
      })

      it('should not type cast any other field', () => {
        expect(databaseService.getConnection(true)).toEqual(connection)

        const { typeCast } = knex.mock.calls[0][0].connection

        const field = { type: 'type' }
        const nextResult = 'nextResult'
        const next = jest.fn().mockReturnValue(nextResult)
        expect(typeCast(field, next)).toBe(nextResult)

        expect(next).toBeCalled()
      })

      it('should type cast date', () => {
        const splitResult = '2021-01-22'

        expect(databaseService.getConnection(true)).toEqual(connection)

        const { typeCast } = knex.mock.calls[0][0].connection

        const jsonString = '2021-01-22T10:53:12'
        const dateField = {
          type: 'DATE',
          string: jest.fn().mockReturnValue(jsonString),
        }
        expect(typeCast(dateField)).toBe(splitResult)

        expect(dateField.string).toBeCalled()
      })

      it('should type cast number', () => {
        expect(databaseService.getConnection(true)).toEqual(connection)

        const { typeCast } = knex.mock.calls[0][0].connection

        const numberString = '1'
        const dateField = {
          type: 'LONG',
          string: jest.fn().mockReturnValue(numberString),
        }
        expect(typeCast(dateField)).toBe(1)
        expect(dateField.string).toBeCalled()
      })

      it('should return null', () => {
        expect(databaseService.getConnection(true)).toEqual(connection)

        const { typeCast } = knex.mock.calls[0][0].connection

        const field = {
          type: 'DATE',
          string: jest.fn().mockReturnValue(null),
        }
        expect(typeCast(field)).toBeNull()
        expect(field.string).toBeCalled()
      })
    })
  })

  describe('queryBuilder', () => {
    it('should use transaction', async () => {
      const results = 'data'
      const table = 'table'
      const transaction = { data: 'transaction' }

      const transacting = jest.fn().mockResolvedValue(results)
      const queryBuilder = jest.fn().mockReturnValue({ transacting })
      const getConnection = jest.spyOn(databaseService, 'getConnection').mockReturnValue(queryBuilder)

      expect(await databaseService.queryBuilder(table, transaction)).toBe(results)

      expect(getConnection).toBeCalled()
      expect(queryBuilder).toBeCalledWith(table)
      expect(transacting).toBeCalledWith(transaction)
    })

    it('should not use transaction', async () => {
      const results = 'data'
      const table = 'table'

      const transacting = jest.fn().mockResolvedValue(results)
      const queryBuilder = jest.fn().mockReturnValue({ transacting })
      const getConnection = jest.spyOn(databaseService, 'getConnection').mockReturnValue(queryBuilder)

      await databaseService.queryBuilder(table)

      expect(getConnection).toBeCalled()
      expect(queryBuilder).toBeCalledWith(table)
      expect(transacting).not.toBeCalled()
    })
  })

  describe('sanitizePayload', () => {
    it('should work when payload exists', async () => {
      const callback = jest.fn().mockReturnValue('data')

      await expect(databaseService.sanitizePayload('data', callback)).toEqual('data')

      expect(callback).toBeCalledWith({
        0: 'd', 1: 'a', 2: 't', 3: 'a',
      })
    })

    it('should work when payload does not exist', async () => {
      const callback = jest.fn()

      await expect(databaseService.sanitizePayload('', callback)).resolves.toBeUndefined()

      expect(callback).not.toBeCalled()
    })
  })

  describe('raw', () => {
    it('should raw a query', async () => {
      const results = 'raw'

      const raw = jest.fn().mockResolvedValue(results)
      const getConnection = jest.spyOn(databaseService, 'getConnection').mockReturnValue({ raw })

      expect(await databaseService.raw('sql query')).toBe(results)

      expect(getConnection).toBeCalled()
      expect(raw).toBeCalledWith('sql query')
    })
  })

  describe('createTransaction', () => {
    it('should use transaction', async () => {
      const handler = jest.fn()
      const results = 'data'

      const transaction = jest.fn().mockResolvedValue(results)
      const getConnection = jest.spyOn(databaseService, 'getConnection').mockReturnValue({ transaction })

      expect(await databaseService.createTransaction(handler)).toBe(results)

      expect(getConnection).toBeCalled()
      expect(transaction).toBeCalledWith(handler)
    })
  })

  describe('select', () => {
    it('should select elements by condition from a table', async () => {
      const table = 'table'
      const condition = { id: 1 }
      const result = ['result']
      const where = jest.fn().mockResolvedValue(result)
      const from = jest.fn().mockReturnValue({ where })
      const select = jest.fn().mockReturnValue({ from })
      const queryBuilder = jest.spyOn(databaseService, 'queryBuilder').mockReturnValue({ select })

      expect(await databaseService.select(table, condition)).toBe(result)

      expect(queryBuilder).toBeCalledWith(table, undefined)
      expect(select).toBeCalled()
      expect(from).toBeCalledWith(table)
      expect(where).toBeCalledWith(condition)
    })
  })

  describe('selectOne', () => {
    it('should select one element by condition from a table', async () => {
      const table = 'table'
      const condition = { id: 1 }
      const result = 'result'
      const first = jest.fn().mockResolvedValue(result)
      const select = jest.spyOn(databaseService, 'select').mockReturnValue({ first })

      expect(await databaseService.selectOne(table, condition)).toBe(result)

      expect(select).toBeCalledWith(table, condition, undefined)
      expect(first).toBeCalled()
    })
  })

  describe('insert', () => {
    it('should insert an element into a table', async () => {
      const table = 'table'
      const data = { firstname: 'John' }
      const result = ['result']
      const into = jest.fn().mockResolvedValue(result)
      const insert = jest.fn().mockReturnValue({ into })
      const queryBuilder = jest.spyOn(databaseService, 'queryBuilder').mockReturnValue({ insert })

      expect(await databaseService.insert(table, data)).toBe(result[0])

      expect(queryBuilder).toBeCalledWith(table, undefined)
      expect(insert).toBeCalledWith(data)
      expect(into).toBeCalledWith(table)
    })
  })

  describe('update', () => {
    it('should update an element in a table with conditions', async () => {
      const table = 'table'
      const data = { firstname: 'John' }
      const conditions = { id: 1, name: '', phone: undefined }
      const result = ['result']
      const update = jest.fn().mockResolvedValue(result)
      const where = jest.fn().mockReturnValue({ update })

      const queryBuilder = jest.spyOn(databaseService, 'queryBuilder').mockReturnValue({ where })

      expect(await databaseService.update(table, data, conditions)).toBe(result)

      expect(queryBuilder).toBeCalledWith(table, undefined)
      expect(where).toBeCalledWith({ id: 1, name: null })
      expect(update).toBeCalledWith(data)
    })

    it('should update an element and wrap false as 0', async () => {
      const table = 'table'
      const data = { firstname: 'John' }
      const conditions = {
        id: 1, name: '', phone: undefined, permission: false,
      }
      const result = ['result']
      const update = jest.fn().mockResolvedValue(result)
      const where = jest.fn().mockReturnValue({ update })

      const queryBuilder = jest.spyOn(databaseService, 'queryBuilder').mockReturnValue({ where })

      expect(await databaseService.update(table, data, conditions)).toBe(result)

      expect(queryBuilder).toBeCalledWith(table, undefined)
      expect(where).toBeCalledWith({ id: 1, name: null, permission: 0 })
      expect(update).toBeCalledWith(data)
    })

    it('should update an element and normalize empty string param as null', async () => {
      const table = 'table'
      const data = { firstname: 'John', lastname: '' }
      const conditions = { id: 1, name: '', phone: undefined }
      const result = ['result']
      const update = jest.fn().mockResolvedValue(result)
      const where = jest.fn().mockReturnValue({ update })

      const queryBuilder = jest.spyOn(databaseService, 'queryBuilder').mockReturnValue({ where })

      expect(await databaseService.update(table, data, conditions)).toBe(result)

      expect(queryBuilder).toBeCalledWith(table, undefined)
      expect(where).toBeCalledWith({ id: 1, name: null })
      expect(update).toBeCalledWith({ firstname: 'John', lastname: null })
    })
  })

  describe('remove', () => {
    it('should remove an element from a table by conditions', async () => {
      const table = 'table'
      const conditions = { id: 1 }
      const result = ['result']
      const del = jest.fn().mockResolvedValue(result)
      const into = jest.fn().mockReturnValue({ del })
      const where = jest.fn().mockReturnValue({ into })

      const queryBuilder = jest.spyOn(databaseService, 'queryBuilder').mockReturnValue({ where })

      expect(await databaseService.remove(table, conditions)).toBe(result)

      expect(queryBuilder).toBeCalledWith(table, undefined)
      expect(where).toBeCalledWith(conditions)
      expect(into).toBeCalledWith(table)
      expect(del).toBeCalled()
    })
  })

  describe('sum', () => {
    it('should return a calculated sum of results', async () => {
      const table = 'table'
      const conditions = { id: 1, name: '', phone: undefined }
      const result = 'result'
      const fields = ['id', 'name']
      const first = jest.fn().mockResolvedValue(result)
      const where = jest.fn().mockReturnValue({ first })
      const sum = jest.fn().mockReturnValue({ where })

      const queryBuilder = jest.spyOn(databaseService, 'queryBuilder').mockReturnValue({ sum })

      expect(await databaseService.sum(table, fields, conditions)).toBe(result)

      expect(queryBuilder).toBeCalledWith(table, undefined)
      expect(where).toBeCalledWith({ id: 1, name: null })
      expect(first).toBeCalled()
    })
  })
})
