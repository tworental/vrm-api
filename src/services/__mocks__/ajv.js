const Ajv = jest.genMockFromModule('ajv')

Ajv.default = jest.fn().mockImplementation((args) => args)

module.exports = Ajv
