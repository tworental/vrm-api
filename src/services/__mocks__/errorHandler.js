const errorHandler = jest.genMockFromModule('../errorHandler')

errorHandler.withErrorReporting = jest.fn().mockImplementation((args) => args)

module.exports = errorHandler
