// Classifies a dependency-update pull request (dependabot, depfu) by risk.
//
// It compares package.json and package-lock.json between the base and the head
// of the PR, and reports what changed, how big each version bump is, and
// whether the change can affect the code that ships to browsers.
//
// This is deliberately deterministic and uses node built-ins only: it decides
// how much scrutiny a PR gets before any AI is involved, and it can run
// without `npm install`.
//
// Usage:
//   node .github/scripts/triage-dependency-pr.mjs --base <git ref> --head <git ref> [--out triage.json]
//
// When $GITHUB_OUTPUT is set, `risk` and `needs_browser_check` are also written
// there so that later workflow steps can use them.

import { execFileSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// Configuration. Tune these lists for the project.
// ---------------------------------------------------------------------------

// Files that a dependency-update PR is expected to touch. Anything else is
// suspicious and makes the PR high risk.
export const EXPECTED_FILES = new Set(['package.json', 'package-lock.json']);

// Runtime packages whose breakage would be felt everywhere or would affect
// authentication and data loading. Major bumps are high risk regardless, but
// these are listed in the report so that reviewers look twice.
export const CRITICAL_PACKAGES = [
  /^react$/,
  /^react-dom$/,
  /^react-router$/,
  /^react-redux$/,
  /^@reduxjs\/toolkit$/,
  /^@mui\//,
  /^@emotion\//,
  /^echarts$/,
  /^taskcluster-/,
  /^json-e$/,
];

// devDependencies that change what ends up in the production bundle, so they
// need a real build and a browser check even though they are "dev" packages.
export const BUNDLE_TOOLING = [
  /^webpack($|-)/,
  /-loader$/,
  /-webpack-plugin$/,
  /^@babel\//,
  /^babel-/,
  /^core-js$/,
  /^react-refresh$/,
  /^regenerator-runtime$/,
  /^react-app-polyfill$/,
];

// Above this many changed packages (a grouped update) the PR is at least
// medium risk, because failures are harder to attribute.
export const GROUPED_UPDATE_THRESHOLD = 15;

// package.json fields that are plain dependency data. Changes to any other
// field (scripts, engines, overrides, ...) are not a plain dependency bump.
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

// Sections whose packages can end up in the code that ships to browsers.
const RUNTIME_FIELDS = new Set([
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
]);

// ---------------------------------------------------------------------------
// Version helpers
// ---------------------------------------------------------------------------

export function parseVersion(input) {
  if (typeof input !== 'string') {
    return null;
  }
  const match = /(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/.exec(input);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    pre: match[4] ?? null,
  };
}

// Returns one of: major, minor, patch, prerelease, downgrade, added, removed,
// unknown.
export function bumpType(from, to) {
  if (from === null || from === undefined) {
    return 'added';
  }
  if (to === null || to === undefined) {
    return 'removed';
  }
  const a = parseVersion(from);
  const b = parseVersion(to);
  if (!a || !b) {
    return 'unknown';
  }
  if (b.major !== a.major) {
    return b.major > a.major ? 'major' : 'downgrade';
  }
  // Below 1.0.0 semver allows breaking changes in the first non-zero part:
  // 0.18 -> 0.19 and 0.0.3 -> 0.0.4 are as breaking as a major bump.
  if (a.major === 0 && b.minor !== a.minor) {
    return b.minor > a.minor ? 'major' : 'downgrade';
  }
  if (a.major === 0 && a.minor === 0 && b.patch !== a.patch) {
    return b.patch > a.patch ? 'major' : 'downgrade';
  }
  if (b.minor !== a.minor) {
    return b.minor > a.minor ? 'minor' : 'downgrade';
  }
  if (b.patch !== a.patch) {
    return b.patch > a.patch ? 'patch' : 'downgrade';
  }
  if (a.pre !== b.pre) {
    return 'prerelease';
  }
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

const RISK_ORDER = ['low', 'medium', 'high'];
const maxRisk = (a, b) =>
  RISK_ORDER.indexOf(a) >= RISK_ORDER.indexOf(b) ? a : b;

const matchesAny = (patterns, name) =>
  patterns.some((pattern) => pattern.test(name));

function scopeOf({ name, direct, section, dev }) {
  if (direct) {
    if (RUNTIME_FIELDS.has(section)) {
      return 'runtime';
    }
    return matchesAny(BUNDLE_TOOLING, name) ? 'bundle-tooling' : 'tooling';
  }
  // Transitive package: the lockfile tells us whether it is dev-only.
  if (dev) {
    return matchesAny(BUNDLE_TOOLING, name) ? 'bundle-tooling' : 'tooling';
  }
  return 'runtime';
}

function riskOf({ scope, bump }) {
  if (['downgrade', 'prerelease', 'added', 'removed'].includes(bump)) {
    return scope === 'tooling' ? 'medium' : 'high';
  }
  if (bump === 'unknown') {
    return scope === 'tooling' ? 'medium' : 'high';
  }
  if (scope === 'tooling') {
    return bump === 'major' ? 'medium' : 'low';
  }
  // runtime and bundle-tooling
  if (bump === 'major') {
    return 'high';
  }
  if (bump === 'minor') {
    return 'medium';
  }
  return 'low';
}

// Package name from a lockfile key like "node_modules/a/node_modules/@s/b".
function nameFromLockKey(key) {
  const index = key.lastIndexOf('node_modules/');
  return key.slice(index + 'node_modules/'.length);
}

function stripDependencyFields(pkg) {
  const copy = { ...pkg };
  for (const field of DEPENDENCY_FIELDS) {
    delete copy[field];
  }
  return copy;
}

function sortedJson(value) {
  return JSON.stringify(value, (_key, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1)),
        )
      : v,
  );
}

export function analyze({
  basePkg,
  headPkg,
  baseLock,
  headLock,
  changedFiles,
}) {
  const reasons = [];
  let risk = 'low';
  const raise = (level, reason) => {
    risk = maxRisk(risk, level);
    reasons.push(reason);
  };
  // Signs of tampering rather than an ordinary update. A blocked PR never has
  // its code run by the workflow, and a human has to look at it.
  const blockers = [];
  const block = (reason) => {
    raise('high', reason);
    blockers.push(reason);
  };

  // 1. Files outside the expected set.
  const unexpectedFiles = changedFiles.filter(
    (file) => !EXPECTED_FILES.has(file),
  );
  if (unexpectedFiles.length > 0) {
    block(
      `The PR changes files other than package.json and package-lock.json: ${unexpectedFiles.join(', ')}`,
    );
  }

  // 2. package.json changes that are not plain dependency data.
  if (
    sortedJson(stripDependencyFields(basePkg)) !==
    sortedJson(stripDependencyFields(headPkg))
  ) {
    block(
      'package.json changed outside the dependency sections (scripts, engines, overrides, ...)',
    );
  }

  // 3. Direct dependencies by section, from package.json. A package listed in
  // several sections keeps a runtime one, the riskier reading.
  const directSection = new Map();
  for (const section of DEPENDENCY_FIELDS) {
    for (const name of Object.keys(headPkg[section] ?? {})) {
      if (!RUNTIME_FIELDS.has(directSection.get(name))) {
        directSection.set(name, section);
      }
    }
    for (const name of Object.keys(basePkg[section] ?? {})) {
      if (!directSection.has(name)) {
        directSection.set(name, section);
      }
    }
  }

  // npm also installs from older lockfiles, which keep their entries under
  // `dependencies`: the checks below read `packages` and would see nothing.
  if (!headLock.packages || !(headLock.lockfileVersion >= 2)) {
    block(
      "The lockfile isn't in the format npm 7+ writes (lockfileVersion 2 or 3), so where its packages come from can't be checked",
    );
  }

  // 4. Per-package changes, from the lockfile (this also covers transitive
  // updates, which are the only change in lockfile-only PRs).
  const basePackages = baseLock.packages ?? {};
  const headPackages = headLock.packages ?? {};
  const keys = new Set([
    ...Object.keys(basePackages),
    ...Object.keys(headPackages),
  ]);
  const byName = new Map();
  const nonRegistry = [];
  const sameVersionSourceChanges = [];

  for (const key of keys) {
    if (key === '' || !key.includes('node_modules/')) {
      continue;
    }
    const before = basePackages[key];
    const after = headPackages[key];
    const from = before?.version ?? null;
    const to = after?.version ?? null;
    const name = nameFromLockKey(key);
    const sourceChanged =
      before?.resolved !== after?.resolved ||
      before?.integrity !== after?.integrity;
    // Checked before skipping unchanged versions: pointing an existing version
    // at another tarball is exactly the tampering this is meant to catch.
    if (
      (from !== to || sourceChanged) &&
      after?.resolved &&
      !after.resolved.startsWith('https://registry.npmjs.org/')
    ) {
      nonRegistry.push(`${name} -> ${after.resolved}`);
    }
    if (from === to) {
      if (before && after && sourceChanged) {
        sameVersionSourceChanges.push(name);
      }
      continue;
    }
    const direct = directSection.has(name) && key === `node_modules/${name}`;
    const section = directSection.get(name);
    const dev = Boolean((after ?? before)?.dev);
    const scope = scopeOf({ name, direct, section, dev });
    const bump = bumpType(from, to);
    const entry = {
      name,
      from,
      to,
      bump,
      scope,
      direct,
      critical: matchesAny(CRITICAL_PACKAGES, name),
      risk: riskOf({ scope, bump }),
    };
    // A package can appear at several places in the tree; keep the riskiest.
    const existing = byName.get(name);
    if (
      !existing ||
      RISK_ORDER.indexOf(entry.risk) > RISK_ORDER.indexOf(existing.risk)
    ) {
      byName.set(name, entry);
    }
  }

  const changes = [...byName.values()].sort(
    (a, b) =>
      RISK_ORDER.indexOf(b.risk) - RISK_ORDER.indexOf(a.risk) ||
      a.name.localeCompare(b.name),
  );

  for (const change of changes) {
    if (change.risk === 'high' || (change.risk === 'medium' && change.direct)) {
      const arrow = `${change.from ?? 'none'} -> ${change.to ?? 'none'}`;
      raise(
        change.risk,
        `${change.name} ${arrow} (${change.bump}, ${change.scope}${change.direct ? '' : ', transitive'}${change.critical ? ', critical' : ''})`,
      );
    } else {
      risk = maxRisk(risk, change.risk);
    }
  }

  if (nonRegistry.length > 0) {
    block(
      `The lockfile resolves packages from outside registry.npmjs.org: ${nonRegistry.join('; ')}`,
    );
  }

  if (sameVersionSourceChanges.length > 0) {
    block(
      `The lockfile changes the tarball or integrity hash of packages without changing their version: ${sameVersionSourceChanges.join(', ')}`,
    );
  }

  if (changes.length >= GROUPED_UPDATE_THRESHOLD) {
    raise(
      'medium',
      `Grouped update touching ${changes.length} packages: failures are harder to attribute`,
    );
  }

  if (changes.length === 0 && unexpectedFiles.length === 0) {
    reasons.push('No package version changes were found in the lockfile.');
  }

  const needsBrowserCheck = changes.some(
    (change) => change.scope === 'runtime' || change.scope === 'bundle-tooling',
  );

  return {
    risk,
    blocked: blockers.length > 0,
    blockers,
    needsBrowserCheck,
    reasons,
    unexpectedFiles,
    changeCount: changes.length,
    changes: changes.slice(0, 200),
  };
}

// ---------------------------------------------------------------------------
// Command line entry point
// ---------------------------------------------------------------------------

function git(...args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
}

function readJsonAt(ref, file) {
  return JSON.parse(git('show', `${ref}:${file}`));
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    if (!flag.startsWith('--') || argv[i + 1] === undefined) {
      throw new Error(`Unexpected argument: ${flag}`);
    }
    args[flag.slice(2)] = argv[i + 1];
  }
  return args;
}

function main() {
  const { base, head, out } = parseArgs(process.argv.slice(2));
  if (!base || !head) {
    throw new Error(
      'Usage: triage-dependency-pr.mjs --base <ref> --head <ref> [--out file]',
    );
  }

  // Compare against the point the PR branched from, not the base branch tip:
  // otherwise commits added to the base branch since then would look like
  // changes the PR reverts.
  const mergeBase = git('merge-base', base, head).trim();

  const changedFiles = git(
    'diff',
    '--name-only',
    '--no-renames',
    mergeBase,
    head,
  )
    .split('\n')
    .filter(Boolean);

  const result = analyze({
    basePkg: readJsonAt(mergeBase, 'package.json'),
    headPkg: readJsonAt(head, 'package.json'),
    baseLock: readJsonAt(mergeBase, 'package-lock.json'),
    headLock: readJsonAt(head, 'package-lock.json'),
    changedFiles,
  });

  const text = JSON.stringify(result, null, 2);
  console.log(text);

  if (out) {
    writeFileSync(out, text + '\n');
  }
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `risk=${result.risk}\nblocked=${result.blocked}\nneeds_browser_check=${result.needsBrowserCheck}\n`,
    );
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
