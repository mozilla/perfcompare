import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['src/**/*.{js,ts,tsx}', '!src/**/*.d.ts'],
  coveragePathIgnorePatterns: ['__tests__', 'index'],
  setupFiles: ['react-app-polyfill/jsdom'],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/utils/setupTests.ts"],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
  ],
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
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  modulePaths: [],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '\\.(css)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
    'jsx',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  resetMocks: true,
  globalSetup: '<rootDir>/src/__tests__/utils/globalSetup.ts',
};

export default config;
