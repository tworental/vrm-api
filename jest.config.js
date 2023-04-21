module.exports = {
  testMatch: ['**/*.spec.js'],
  testEnvironment: 'node',
  modulePathIgnorePatterns: [
    '<rootDir>/src/.*/__mocks__',
    '<rootDir>/src/__fixtures__',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/**/index.js',
    '!src/**/*.ispec.js',
    '!src/**/schema.js',
    '!src/**/constants.js',
  ],
  coveragePathIgnorePatterns: [
    '/__tests__',
    '/__fixtures__',
  ],
  roots: [
    '<rootDir>/src/',
  ],
}
