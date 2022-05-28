module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'import', 'jest', 'react'],
  extends: [
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
      files: ['*.ts', '*.tsx'],
      // We should extend TypeScript plugins here instead of extending them
      // outside the `overrides`.
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'airbnb-typescript',
      ],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      rules: {
        // https://github.com/typescript-eslint/typescript-eslint/issues/1824
        '@typescript-eslint/indent': 'off',
      },
    },
    {
      // typescript test files
      files: ['src/tests/**/*.{ts,tsx}'],
      rules: {
        // TODO: update tests to not use store directly and remove these overrides
        // https://github.com/mozilla/perfcompare/issues/115
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        // test dependencies should only exist in devDependencies
        'import/no-extraneous-dependencies': 'off',
      },
    },
    // javascript files
    {
      files: ['src/**/*.js'],
      // disable forcing type for template literal in JS files
      rules: { '@typescript-eslint/restrict-template-expressions': 'off' },
    },
  ],
};
