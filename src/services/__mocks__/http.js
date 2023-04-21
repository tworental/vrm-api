const http = jest.genMockFromModule('../http')

http.handler = jest.fn().mockImplementation((args) => args)

module.exports = http
