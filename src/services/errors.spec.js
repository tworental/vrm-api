const createError = require('http-errors')

const errorsService = require('./errors')

describe('errors service', () => {
  it('should create a new error', () => {
    expect(errorsService).toBe(createError)
  })
})
