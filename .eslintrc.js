module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  plugins: ['import', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:jest/recommended',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  overrides: [
    {
      // TypeScript linting
      files: ['src/**/**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'airbnb-typescript',
        'plugin:import/typescript',
        'prettier',
      ],

      rules: {
        'react/prop-types': ['off'],
      },
    },
    {
      // Typescript test files
      files: ['src/__tests__/**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      plugins: ['jest', 'jest-formatting'],
      extends: [
        'plugin:jest/recommended',
        'plugin:import/typescript',
        'plugin:testing-library/react',
        'plugin:jest-dom/recommended',
        'prettier',
      ],
      rules: {
        // TODO: update tests to not use store directly and remove these overrides
        // https://github.com/mozilla/perfcompare/issues/115
        '@typescript-eslint/no-unsafe-member-access': 'off',

        // This disallows using direct Node properties (eg: firstChild), but we have
        // legitimate uses:
        'testing-library/no-node-access': 'off',
        // Other useful rules in testing-library
        'testing-library/prefer-explicit-assert': [
          'error',
          { includeFindQueries: false },
        ],

        // Individual jest-formatting rules so that we format only test and describe blocks
        'jest-formatting/padding-around-describe-blocks': 2,
        'jest-formatting/padding-around-test-blocks': 2,
      },
    },
    {
      // JavaScript linting
      files: ['src/**/*.js', 'webpack/**/*.js', '*.js'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
      },
    },
  ],
  // This property is specified both here in addition to the command line in
  // package.json.
  // The reason is that the property only warns but the command line option
  // outputs errors, but the property is useful so that we have the information
  // directly in editors.
  reportUnusedDisableDirectives: true,
};
