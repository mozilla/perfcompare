import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['src/**/*.{js,ts,tsx}', '!src/**/*.d.ts'],
  coveragePathIgnorePatterns: ['__tests__', 'index', 'resources', 'styles'],
  setupFiles: ['react-app-polyfill/jsdom'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/utils/setupTests.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/__tests__/utils/'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
    '^.+\\.svg$': '<rootDir>/src/__tests__/utils/fileTransformer.js',
  },
  // This transformIgnorePatterns is better understood as a double negation: the
  // package names below _will_ be transformed.
  // This is needed mostly because our fetch-mock doesn't use esm, but these
  // dependencies of fetch-mock do! Hopefully this won't be needed in the future
  // when fetch-mock updates.
  transformIgnorePatterns: [
    '/node_modules/(?!(data-uri-to-buffer|fetch-blob|formdata-polyfill|node-fetch)/)',
  ],
  modulePaths: [],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '\\.(css)$': 'identity-obj-proxy',
    '\\.(woff|woff2|ttf)$':
      '<rootDir>/src/mockData/mockedFonts/Metropolis-Bold.woff2',
  },
  moduleFileExtensions: ['js', 'ts', 'tsx', 'jsx'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  globalSetup: '<rootDir>/src/__tests__/utils/globalSetup.ts',
  testTimeout: 30000,
};

export default config;
