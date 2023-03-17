module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  plugins: [
    'import',
    'react',
    'jsx-a11y'
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:jest/recommended',
    'prettier',
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended"
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
    "@typescript-eslint/no-var-requires": "off",
    'jsx-a11y/accessible-emoji': 1,
    'jsx-a11y/alt-text': 1,
    'jsx-a11y/anchor-has-content': 1,
    'jsx-a11y/aria-role': 1,
    'jsx-a11y/anchor-is-valid': 1,
    'jsx-a11y/aria-activedescendant-has-tabindex': 1,
    'jsx-a11y/img-redundant-alt': 1,
    'jsx-a11y/tabindex-no-positive': 1,
    "jsx-a11y/aria-props": 1,
    "jsx-a11y/aria-proptypes": 1,
    "jsx-a11y/aria-unsupported-elements": 1,
    "jsx-a11y/heading-has-content": 1,
    "jsx-a11y/mouse-events-have-key-events": 1,
    "jsx-a11y/no-access-key": 1,
    "jsx-a11y/no-autofocus": 1,
    "jsx-a11y/no-distracting-elements": 1,
    "jsx-a11y/no-interactive-element-to-noninteractive-role": 1,
    "jsx-a11y/no-noninteractive-element-interactions": 1,
    "jsx-a11y/no-noninteractive-element-to-interactive-role": 1,
    "jsx-a11y/no-noninteractive-tabindex": 1,
    "jsx-a11y/no-onchange": 1,
    "jsx-a11y/no-redundant-roles": 1,
    "jsx-a11y/no-static-element-interactions": 1,
    "jsx-a11y/role-has-required-aria-props": 1,
    "jsx-a11y/role-supports-aria-props": 1,
    "jsx-a11y/label-has-associated-control": [1, {
      "controlComponents": ["Input"]
    }]

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
      plugins: [
        '@typescript-eslint',
        "jsx-a11y",
        "@typescript-eslint/eslint-plugin"
      ],
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