/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  globalSetup: './src/tests/utils/globalSetup.ts',
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./src/tests/utils/setupTests.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.ts?$': 'ts-jest',
    '^.+\\.svg$': '<rootDir>/src/tests/utils/fileTransformer.js',
  },
};
