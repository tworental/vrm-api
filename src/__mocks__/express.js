const express = {}

express.use = jest.fn()
express.get = jest.fn()
express.put = jest.fn()
express.post = jest.fn()
express.patch = jest.fn()
express.delete = jest.fn()

express.Router = jest.fn()

module.exports = jest.fn().mockImplementation(() => express)
