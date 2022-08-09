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
      ],

      rules: {
        // https://github.com/typescript-eslint/typescript-eslint/issues/1824
        '@typescript-eslint/indent': 'off',
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
      plugins: ['jest'],
      extends: ['plugin:jest/recommended', 'plugin:import/typescript'],
      rules: {
        // TODO: update tests to not use store directly and remove these overrides
        // https://github.com/mozilla/perfcompare/issues/115
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        // test dependencies should only exist in devDependencies
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      // JavaScript linting
      files: ['src/**/*.js', 'webpack/**/*.js'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
      },
    },
  ],
}
