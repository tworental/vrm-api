const { CODES, MESSAGES } = require('./errorCodes')

describe('errorCodes', () => {
  it('should have the same keys', () => {
    expect(Object.keys(CODES)).toEqual(Object.keys(MESSAGES))
  })
})
