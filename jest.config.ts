import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['src/**/*.{js,ts,tsx}', '!src/**/*.d.ts'],
  coveragePathIgnorePatterns: [
    '__tests__',
    'index',
    'resources',
    'styles',
    // Pure-math helpers exercised indirectly by the chart code; not worth
    // the ceremony of unit-testing the numerical routines themselves.
    'src/utils/bootstrap-ci\\.[jt]s',
    'src/utils/kde\\.js',
  ],
  setupFiles: ['react-app-polyfill/jsdom'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/utils/setupTests.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/__tests__/utils/'],
  testEnvironment: './src/__tests__/utils/custom-environment',
  transform: {
    '^.+\\.[cm]?[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
            // react-router (ESM-only since v8) guards a dev-only HMR branch
            // with `import.meta.hot`, which is a syntax error once swc
            // transforms the module to CommonJS for jest. There is no HMR in
            // tests, so compile the check away.
            optimizer: {
              globals: {
                vars: {
                  'import.meta.hot': 'undefined',
                },
              },
            },
          },
        },
      },
    ],
    '^.+\\.(?:svg|png)$': '<rootDir>/src/__tests__/utils/fileTransformer.js',
  },
  // This transformIgnorePatterns is better understood as a double negation: the
  // package names below _will_ be transformed.
  // This is needed mostly because our fetch-mock doesn't use esm, but these
  // dependencies of fetch-mock do! Hopefully this won't be needed in the future
  // when fetch-mock updates.
  transformIgnorePatterns: [
    '/node_modules/(?!(taskcluster-client-web|data-uri-to-buffer|fetch-blob|formdata-polyfill|fetch-mock|@fetch-mock/jest|react-router|cookie-es)/)',
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
  globalSetup: '<rootDir>/src/__tests__/utils/globalSetup.ts',
  testTimeout: 30000,
};

export default config;
