// Runs the same checks as CircleCI (lint, formatting, types, unit tests) plus
// the production build, and records which ones failed with the end of their
// output.
//
// The dependency PR workflow runs this on the pull request to decide whether
// "CI passes", and again after the agent's fix to verify it: the agent's own
// claims are never trusted. Every check runs even if an earlier one failed, so
// the agent sees all the failures at once.
//
// Uses node built-ins only, so it can run from a trusted checkout of the base
// branch against the pull request's working tree.
//
// Usage:
//   node .github/scripts/run-checks.mjs --out checks.json [--log-dir dir] [--cwd dir]
//
// When $GITHUB_OUTPUT is set, `passed=true|false` is written there.

import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Keep in sync with .circleci/config.yml.
export const CHECKS = [
  { name: 'lint', command: 'npm', args: ['run', 'lint'] },
  { name: 'format', command: 'npm', args: ['run', 'format:check'] },
  { name: 'types', command: 'npm', args: ['run', 'tsc'] },
  {
    name: 'unit tests',
    command: 'npm',
    args: ['test', '--', '--ci', '-w=4', '--workerIdleMemoryLimit=1.5G'],
  },
  { name: 'build', command: 'npm', args: ['run', 'build'] },
];

const TAIL_LINES = 150;

// eslint-disable-next-line no-control-regex
const ANSI = /\x1b\[[0-9;]*[A-Za-z]/g;

export function tail(output, lines = TAIL_LINES) {
  const all = output.replace(ANSI, '').trimEnd().split('\n');
  return all.slice(-lines).join('\n');
}

export function summarize(results) {
  return {
    passed: results.every((result) => result.passed),
    failed: results
      .filter((result) => !result.passed)
      .map((result) => result.name),
    checks: results,
  };
}

function slug(name) {
  return name.replace(/[^a-z0-9]+/gi, '-');
}

function runCheck(check, { cwd, logDir }) {
  const started = Date.now();
  const run = spawnSync(check.command, check.args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, CI: 'true', FORCE_COLOR: '0' },
  });
  const output = `${run.stdout ?? ''}${run.stderr ?? ''}${run.error ? String(run.error) : ''}`;
  let logFile = null;
  if (logDir) {
    logFile = join(logDir, `${slug(check.name)}.log`);
    writeFileSync(logFile, output);
  }
  return {
    name: check.name,
    command: [check.command, ...check.args].join(' '),
    passed: run.status === 0,
    seconds: Math.round((Date.now() - started) / 1000),
    logFile,
    outputTail: tail(output),
  };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i].startsWith('--') || argv[i + 1] === undefined) {
      throw new Error(`Unexpected argument: ${argv[i]}`);
    }
    args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

function main() {
  const {
    out,
    cwd = process.cwd(),
    ['log-dir']: logDir,
  } = parseArgs(process.argv.slice(2));
  if (!out) {
    throw new Error('--out is required');
  }
  if (logDir) {
    mkdirSync(logDir, { recursive: true });
  }

  const results = [];
  for (const check of CHECKS) {
    console.log(
      `::group::${check.name}: ${check.command} ${check.args.join(' ')}`,
    );
    const result = runCheck(check, { cwd, logDir });
    console.log(result.outputTail);
    console.log('::endgroup::');
    console.log(`${result.passed ? 'passed' : 'FAILED'}: ${check.name}`);
    results.push(result);
  }

  const summary = summarize(results);
  writeFileSync(out, JSON.stringify(summary, null, 2) + '\n');
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `passed=${summary.passed}\n`);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
