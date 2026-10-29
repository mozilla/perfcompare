import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { disallowedPaths } from './fix-paths.mjs';

describe('disallowedPaths', () => {
  it('allows application code, tests and tool configuration', () => {
    assert.deepEqual(
      disallowedPaths(
        [
          'src/components/App.tsx',
          'src/__tests__/App.test.tsx',
          'src/__tests__/__snapshots__/App.test.tsx.snap',
          'eslint.config.mjs',
          'tsconfig.json',
          'webpack/webpack.config.js',
        ],
        'apply',
      ),
      [],
    );
  });

  it('never allows dependencies, CI or workflow files', () => {
    const files = [
      'package.json',
      'package-lock.json',
      '.github/workflows/dependency-pr-review.yml',
      '.github/scripts/run-checks.mjs',
      '.circleci/config.yml',
      '.npmrc',
    ];
    assert.deepEqual(disallowedPaths(files, 'apply'), files);
    assert.deepEqual(disallowedPaths(files, 'propose'), files);
  });

  it('allows browser test changes in proposals only', () => {
    assert.deepEqual(disallowedPaths(['e2e/smoke.spec.ts'], 'apply'), [
      'e2e/smoke.spec.ts',
    ]);
    assert.deepEqual(disallowedPaths(['e2e/smoke.spec.ts'], 'propose'), []);
  });
});
