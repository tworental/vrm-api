const supertest = require('supertest')

jest.unmock('config')
jest.unmock('express')
jest.unmock('body-parser')

const app = require('../../app')

describe('GET /healthz', () => {
  let request

  beforeAll(() => {
    request = supertest(app)
  })

  it('should returns 200 status', async () => {
    const { statusCode } = await request.get('/v1/healthz')

    expect(statusCode).toEqual(200)
  })
})
