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
    // require line break after operator
    'operator-linebreak': ['error', 'after'],
    // error on prettier lint issues
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['src/tests/**/*'],
      rules: {
        'react/prop-types': 'off',
        'import/no-import-module-exports': 'off',
        'import/no-extraneous-dependencies': 'off',
        'function-paren-newline': 'off',
        'implicit-arrow-linebreak': 'off',
      },
    },
  ],
};
