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
    // require line break after operator
    'operator-linebreak': ['error', 'after'],
    // error on prettier lint issues
    'prettier/prettier': 'error',
    // ignore rule for reducers updating state
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['state'] },
    ],
  },
  overrides: [
    {
      files: ['*test*', 'setupTests.js'],
      rules: {
        'react/prop-types': 'off',
        'import/no-extraneous-dependencies': 'off',
        'function-paren-newline': 'off',
        'implicit-arrow-linebreak': 'off',
      },
    },
  ],
};
