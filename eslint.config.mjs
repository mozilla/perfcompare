import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import jestDomPlugin from 'eslint-plugin-jest-dom';
import reactPlugin from 'eslint-plugin-react';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  importPlugin.flatConfigs.recommended,
  prettierConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },

      react: { version: 'detect' },
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
      // This rule doesn't seem important enough to be flagged.
      'import/no-named-as-default-member': 'off',
    },

    linterOptions: {
      // This property is specified both here in addition to the command line in
      // package.json.
      // The reason is that the property only warns but the command line option
      // outputs errors, but the property is useful so that we have the information
      // directly in editors.
      reportUnusedDisableDirectives: true,
    },
  },
  {
    // TypeScript linting
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      importPlugin.flatConfigs.typescript,
    ],

    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
      },
    },
  },
  {
    // Typescript test files
    files: ['src/__tests__/**/*.{ts,tsx}'],
    extends: [
      jestPlugin.configs['flat/recommended'],
      jestPlugin.configs['flat/style'],
      testingLibraryPlugin.configs['flat/react'],
      jestDomPlugin.configs['flat/recommended'],
    ],

    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    rules: {
      // TODO: update tests to not use store directly and remove these overrides
      // https://github.com/mozilla/perfcompare/issues/115
      '@typescript-eslint/no-unsafe-member-access': 'off',
      // We can be less strict in tests about non-null assertions, to make it easier.
      '@typescript-eslint/no-non-null-assertion': 'off',
      // In tests we can accept that async functions do not have await directives.
      '@typescript-eslint/require-await': 'off',

      // This disallows using direct Node properties (eg: firstChild), but we have
      // legitimate uses:
      'testing-library/no-node-access': 'off',

      // Other useful rules in testing-library
      'testing-library/prefer-explicit-assert': [
        'error',
        { includeFindQueries: false },
      ],

      // Individual jest-formatting rules so that we format only test and describe blocks
      'jest/padding-around-describe-blocks': 2,
      'jest/padding-around-test-blocks': 2,
    },
  },
  {
    // JavaScript linting
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
]);
