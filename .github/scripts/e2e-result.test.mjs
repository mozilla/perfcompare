import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const script = new URL('./e2e-result.mjs', import.meta.url).pathname;

function run(report, exitCode) {
  const dir = mkdtempSync(join(tmpdir(), 'e2e-result-'));
  const path = join(dir, 'results.json');
  if (report) {
    writeFileSync(path, JSON.stringify(report));
  }
  return execFileSync(
    process.execPath,
    [script, '--report', path, '--exit-code', exitCode],
    { encoding: 'utf8' },
  ).trim();
}

const passing = {
  stats: { expected: 2, unexpected: 0, flaky: 0, skipped: 0 },
  suites: [],
};

describe('e2e-result', () => {
  it('prints passed only for a successful run', () => {
    assert.equal(run(passing, '0'), 'passed');
    assert.equal(run(passing, '1'), 'failed');
    assert.equal(run(passing, ''), 'failed');
  });

  it('prints failed for a run that broke before running the tests', () => {
    const broken = {
      stats: { expected: 0, unexpected: 0, flaky: 0, skipped: 0 },
      errors: [{ message: 'Error: Timed out waiting for config.webServer' }],
      suites: [],
    };
    assert.equal(run(broken, '0'), 'failed');
  });

  it('prints missing when there is no report', () => {
    assert.equal(run(null, '1'), 'missing');
  });
});
