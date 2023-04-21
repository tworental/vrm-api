const dao = jest.genMockFromModule('../dao')

dao.mockImplementation((args) => args)

module.exports = dao
