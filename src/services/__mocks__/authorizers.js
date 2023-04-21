const authorizers = jest.genMockFromModule('../authorizers')

authorizers.checkQuota.mockImplementation((fn) => fn)
authorizers.checkModule.mockImplementation((fn) => fn)

module.exports = authorizers
