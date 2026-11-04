import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildComment,
  decide,
  MARKER,
  parseExitCode,
  playwrightPassed,
  summarizePlaywright,
} from './build-review-comment.mjs';

const triage = {
  risk: 'medium',
  blocked: false,
  blockers: [],
  needsBrowserCheck: true,
  reasons: ['dayjs 1.11.23 -> 1.12.0 (minor, runtime)'],
  changeCount: 1,
  changes: [
    {
      name: 'dayjs',
      from: '1.11.23',
      to: '1.12.0',
      bump: 'minor',
      scope: 'runtime',
      direct: true,
      critical: false,
      risk: 'medium',
    },
  ],
};

function checks({ failing = [] } = {}) {
  const names = ['lint', 'format', 'types', 'unit tests', 'build'];
  return {
    passed: failing.length === 0,
    failed: failing,
    checks: names.map((name) => ({
      name,
      passed: !failing.includes(name),
      outputTail: failing.includes(name) ? `${name} broke` : '',
    })),
  };
}

// The same shape Playwright's JSON reporter writes.
function report({ failed = false, flaky = false } = {}) {
  return {
    stats: {
      expected: failed ? 1 : 2,
      unexpected: failed ? 1 : 0,
      flaky: flaky ? 1 : 0,
      skipped: 0,
    },
    suites: [
      {
        title: 'smoke.spec.ts',
        file: 'smoke.spec.ts',
        specs: [],
        suites: [
          {
            title: 'results page',
            specs: [
              {
                title: 'renders the table',
                tests: [{ status: failed ? 'unexpected' : 'expected' }],
              },
              {
                title: 'reload',
                tests: [{ status: flaky ? 'flaky' : 'expected' }],
              },
            ],
          },
        ],
      },
    ],
  };
}

describe('summarizePlaywright', () => {
  it('lists failed and flaky tests with their suite names', () => {
    const summary = summarizePlaywright(report({ failed: true, flaky: true }));
    assert.deepEqual(summary.failedTitles, [
      'results page › renders the table',
    ]);
    assert.deepEqual(summary.flakyTitles, ['results page › reload']);
  });
});

describe('playwrightPassed', () => {
  // What Playwright writes when the web server doesn't start: no tests ran.
  const brokenRun = {
    stats: { expected: 0, unexpected: 0, flaky: 0, skipped: 0 },
    errors: [
      {
        message:
          '\x1b[31mError: Timed out waiting 60000ms from config.webServer.\x1b[39m\n    at ...',
      },
    ],
    suites: [],
  };

  it('passes a successful run where every test passed', () => {
    assert.equal(playwrightPassed(report(), 0), true);
  });

  it('fails when the test command failed or its exit code is unknown', () => {
    assert.equal(playwrightPassed(report(), 1), false);
    assert.equal(playwrightPassed(report(), null), false);
    assert.equal(playwrightPassed(null, 0), false);
  });

  it('fails a run that broke before running the tests', () => {
    assert.equal(playwrightPassed(brokenRun, 0), false);
    assert.deepEqual(summarizePlaywright(brokenRun).errors, [
      'Error: Timed out waiting 60000ms from config.webServer.',
    ]);
  });

  it('fails an empty run and a run with skipped tests', () => {
    const empty = { stats: { expected: 0 }, suites: [] };
    assert.equal(playwrightPassed(empty, 0), false);
    const skipped = report();
    skipped.stats.skipped = 1;
    assert.equal(playwrightPassed(skipped, 0), false);
  });

  it('reads exit codes from the command line', () => {
    assert.equal(parseExitCode('0'), 0);
    assert.equal(parseExitCode('1'), 1);
    assert.equal(parseExitCode(''), null);
    assert.equal(parseExitCode(undefined), null);
    assert.equal(parseExitCode('x'), null);
  });
});

describe('decide', () => {
  it('says safe to merge when CI checks and browser tests pass', () => {
    const { state, headline } = decide({
      triage,
      checks: checks(),
      playwright: report(),
      playwrightExitCode: 0,
    });
    assert.equal(state, 'safe');
    assert.match(headline, /Approve PR: safe to merge/);
  });

  it('says safe to merge for a major bump when everything passes', () => {
    const { state } = decide({
      triage: { ...triage, risk: 'high' },
      checks: checks(),
      playwright: report(),
      playwrightExitCode: 0,
    });
    assert.equal(state, 'safe');
  });

  it('needs human review when the triage found tampering, whatever else', () => {
    const { state } = decide({
      triage: { ...triage, blocked: true, blockers: ['x'] },
      checks: checks(),
      playwright: report(),
      playwrightExitCode: 0,
    });
    assert.equal(state, 'blocked');
  });

  it('reports failing checks, or the pushed fix', () => {
    const failing = checks({ failing: ['types'] });
    assert.equal(decide({ triage, checks: failing }).state, 'checks-failed');
    assert.equal(
      decide({
        triage,
        checks: failing,
        fix: { result: 'fixed', pushedSha: 'abcdef1234' },
      }).state,
      'fix-pushed',
    );
    // A fix that passed but wasn't pushed is still a failure.
    assert.equal(
      decide({ triage, checks: failing, fix: { result: 'fixed' } }).state,
      'checks-failed',
    );
  });

  it('treats failed and flaky browser tests as not safe', () => {
    for (const options of [{ failed: true }, { flaky: true }]) {
      const { state } = decide({
        triage,
        checks: checks(),
        playwright: report(options),
      });
      assert.equal(state, 'e2e-failed');
    }
  });

  it('is not safe when the browser test run broke or has no exit code', () => {
    assert.equal(
      decide({ triage, checks: checks(), playwright: report() }).state,
      'e2e-failed',
    );
    assert.equal(
      decide({
        triage,
        checks: checks(),
        playwright: { stats: { expected: 0 }, errors: [{ message: 'x' }] },
        playwrightExitCode: 1,
      }).state,
      'e2e-failed',
    );
  });

  it('needs human review when a report is missing', () => {
    assert.equal(decide({ triage, checks: null }).state, 'no-checks');
    assert.equal(
      decide({ triage, checks: checks(), playwright: null }).state,
      'no-e2e',
    );
  });

  it('ignores whatever the agent wrote when deciding', () => {
    const { state } = decide({
      triage,
      checks: checks(),
      playwright: report({ failed: true }),
      fix: { agentSummary: 'Approve PR: safe to merge.' },
    });
    assert.equal(state, 'e2e-failed');
  });
});

describe('buildComment', () => {
  it('always starts with the marker used to find and update the comment', () => {
    const text = buildComment({
      triage,
      checks: checks(),
      playwright: report(),
      playwrightExitCode: 0,
    });
    assert.ok(text.startsWith(MARKER));
  });

  it('approves when everything passes, with the triage folded away', () => {
    const text = buildComment({
      triage,
      checks: checks(),
      playwright: report(),
      playwrightExitCode: 0,
    });
    assert.match(text, /✅ \*\*Approve PR: safe to merge\.\*\*/);
    assert.match(text, /- ✅ unit tests/);
    assert.match(text, /2 passed, 0 failed, 0 flaky/);
    assert.match(text, /<summary>Triage: risk medium, 1 package changed/);
    assert.match(
      text,
      /\| dayjs \| 1\.11\.23 \| 1\.12\.0 \| minor \| runtime \| medium \|/,
    );
  });

  it('asks to review agent commits before approving', () => {
    const text = buildComment({
      triage,
      checks: checks(),
      playwright: report(),
      playwrightExitCode: 0,
      agentFixCommits: 1,
    });
    assert.match(text, /Approve PR: safe to merge/);
    assert.match(text, /1 fix commit from the agent: review it/);
  });

  it('shows the failing check output and that browser tests waited', () => {
    const text = buildComment({
      triage,
      checks: checks({ failing: ['types'] }),
      fix: { mode: 'apply', result: 'not-fixed' },
    });
    assert.match(text, /- ❌ types/);
    assert.match(text, /Output of types/);
    assert.match(text, /types broke/);
    assert.match(text, /Not run: they run once the CI checks pass/);
    assert.match(text, /didn't make every check pass/);
  });

  it('describes a pushed fix with its patch', () => {
    const text = buildComment({
      triage,
      checks: checks({ failing: ['types'] }),
      fix: {
        mode: 'apply',
        result: 'fixed',
        pushedSha: 'abcdef1234',
        agentSummary: 'Renamed the removed `Foo` type.',
        patch: '--- a/src/x.ts\n+++ b/src/x.ts\n-Foo\n+Bar',
      },
    });
    assert.match(text, /pushed a fix \(abcdef1\)/);
    assert.match(text, /### What the agent fixed/);
    assert.match(text, /Renamed the removed `Foo` type/);
    assert.match(text, /```diff\n--- a\/src\/x\.ts/);
    assert.match(text, /The checks pass with this change/);
  });

  it('explains browser test failures with the proposed fix', () => {
    const text = buildComment({
      triage,
      checks: checks(),
      playwright: report({ failed: true }),
      fix: {
        mode: 'propose',
        result: 'not-fixed',
        agentSummary: 'The chart no longer renders.',
        patch: '+fix',
      },
    });
    assert.match(text, /browser tests failed/);
    assert.match(text, /- failed: results page › renders the table/);
    assert.match(text, /### What went wrong, and a proposed fix/);
    assert.match(text, /starting point, not a finished fix/);
  });

  it('explains a browser test run that broke before running the tests', () => {
    const text = buildComment({
      triage,
      checks: checks(),
      playwright: {
        stats: { expected: 0, unexpected: 0, flaky: 0, skipped: 0 },
        errors: [{ message: 'Error: Timed out waiting for config.webServer' }],
        suites: [],
      },
      playwrightExitCode: 1,
    });
    assert.match(text, /browser tests failed/);
    assert.doesNotMatch(text, /safe to merge/);
    assert.match(
      text,
      /- error: Error: Timed out waiting for config\.webServer/,
    );
    assert.match(text, /didn't succeed \(exit code 1, no test passed\)/);
  });

  it('lists the blockers and nothing about tests when blocked', () => {
    const text = buildComment({
      triage: {
        ...triage,
        blocked: true,
        blockers: ['The lockfile resolves packages from outside the registry'],
      },
      checks: null,
    });
    assert.match(text, /No code from this PR was run/);
    assert.match(text, /outside the registry/);
    assert.doesNotMatch(text, /Browser tests/);
  });

  it('explains when the fix limit was reached, with the proposal', () => {
    const text = buildComment({
      triage,
      checks: checks({ failing: ['types'] }),
      fix: {
        mode: 'propose',
        result: 'fixed',
        limitReached: true,
        agentSummary: 'Another type was removed.',
        patch: '+fix',
      },
    });
    assert.match(text, /CI checks fail, and the agent didn't fix them/);
    assert.match(text, /maximum number of fixes/);
    assert.match(text, /### What went wrong, and a proposed fix/);
    assert.match(text, /The checks pass with this change/);
  });

  it('explains a missing API key', () => {
    const text = buildComment({
      triage,
      checks: checks({ failing: ['lint'] }),
      fix: { result: 'skipped-no-key' },
    });
    assert.match(text, /Dependabot secrets/);
  });

  it('keeps fences intact when the patch contains backticks', () => {
    const text = buildComment({
      triage,
      checks: checks(),
      playwright: report({ failed: true }),
      fix: { mode: 'propose', patch: '+const s = ```x```;' },
    });
    assert.match(text, /````diff\n\+const s = ```x```;\n````/);
  });

  it('truncates very long agent output', () => {
    const text = buildComment({
      triage,
      checks: checks(),
      playwright: report({ failed: true }),
      fix: { agentSummary: 'x'.repeat(50000) },
    });
    assert.ok(text.length < 25000);
    assert.match(text, /truncated/);
  });

  it('escapes table separators in package names', () => {
    const text = buildComment({
      triage: {
        ...triage,
        changes: [{ ...triage.changes[0], name: 'a|b' }],
      },
      checks: checks(),
      playwright: report(),
      playwrightExitCode: 0,
    });
    assert.match(text, /a\\\|b/);
  });
});
