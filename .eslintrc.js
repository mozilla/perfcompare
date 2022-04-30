module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'implicit-arrow-linebreak': 'off',
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
    // ignore rule for reducers updating state
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['state'] },
    ],
    // this rule prevents using identifiers such as '_foo' or '__bar__',
    // which indicate to those contributing that this should not be
    // used outside the context in which it is defined
    'no-underscore-dangle': 'off',
    // require line breaks between curly braces in imports
    // only if there are line breaks between properties
    'object-curly-newline': [
      'error',
      { ImportDeclaration: { multiline: true } },
    ],
    'operator-linebreak': 'off',
    // error on prettier lint issues
    'prettier/prettier': 'error',
    'react/jsx-filename-extension': [
      2,
      { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    ],
  },
  overrides: [
    {
      files: ['src/tests/**/*.{js,jsx,ts,tsx}'],
      extends: ['airbnb-typescript'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'react/prop-types': 'off',
        'function-paren-newline': 'off',
        'import/no-extraneous-dependencies': 'off',
        'import/no-import-module-exports': 'off',
        '@typescript-eslint/indent': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      excludedFiles: 'src/tests/**',
      extends: ['airbnb-typescript'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        // https://github.com/typescript-eslint/typescript-eslint/issues/1824
        '@typescript-eslint/indent': 'off',
      },
    },
  ],
};
